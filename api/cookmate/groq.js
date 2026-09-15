const fetch = require("node-fetch");
const crypto = require("crypto");
const { verifyUser, unauthorized } = require("../../lib/auth");
const {
  tryConsumeFreeUsage,
  reserveCredits,
  settleCredits,
  releaseReservation,
  getWallet,
  isPlusSubscriber,
  consumeAdBonusAction,
  restoreAdBonusAction,
  releaseFreeUsage,
} = require("../../lib/wallet");
const {
  FREE_DAILY_LIMITS,
  PLUS_DAILY_LIMITS,
  MAX_OUTPUT_TOKENS,
  GROQ_MODEL,
  groqCostUsd,
  creditsForTokens,
} = require("../../lib/config");
const cache = require("../../lib/supabaseCache");

const KEY_MAP = {
  chat: process.env.GROQ_KEY_CHAT,
  leftover: process.env.GROQ_KEY_LEFTOVER,
  planner: process.env.GROQ_KEY_PLANNER,
  recipe_detail: process.env.GROQ_KEY_RECIPE,
  recipe_search: process.env.GROQ_KEY_RECIPE,
};

/** Builds the ingredients_key the way the original app implicitly did
 * (a stable, order-independent string from a normalized ingredient
 * list) - used as the leftover_cache lookup key. */
function ingredientsKey(ingredients) {
  return ingredients
    .map((i) => i.replace(/^[^\w]*/, "").trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(",");
}

function buildPrompt(type, params) {
  switch (type) {
    case "recipe_detail":
      return (
        `Full recipe for "${params.recipe_name}" for ${params.servings} people. ` +
        `Write everything in English. Return JSON object:` +
        `{name,emoji,description,time,prepTime,cookTime,diff,servings,` +
        `ingredients:[{item,amount,unit}],` +
        `steps:[{num,title,desc,timerMin,tip}],` +
        `prepTips:[],cookTips:[],servingSuggestions:[],` +
        `nutrition:{calories,protein,carbs,fat,fiber}}`
      );
    case "recipe_search":
      return (
        `I have: ${params.ingredients.join(", ")}. Suggest 10 recipes. ` +
        `Return JSON array:[{name,emoji,time,diff,cal,protein,tags,usesIngredients:[]}]`
      );
    case "leftover":
      return (
        `Leftovers: ${params.ingredients.join(", ")}. Suggest 4 creative recipes. ` +
        `Return JSON array:[{name,emoji,time,diff,cal,idea,ingredients:[],why}]`
      );
    case "grocery":
      return (
        `Grocery list for: ${params.recipe_name}. Return JSON:` +
        `{needed:[{item,amount,category,note}],` +
        `alternatives:[{original,substitute,note}],tips:[string]}`
      );
    case "nutrition":
      return (
        `Give accurate nutritional information for "${params.food_name}". ` +
        `Calculate based on the quantity mentioned, or a typical serving if ` +
        `none is given. Return ONLY valid JSON: ` +
        `{"calories":0,"protein":"0g","carbs":"0g","fat":"0g","fiber":"0g"}`
      );
    case "planner":
      return (
        `Suggest 6 diverse recipes for ${params.mealType} on ${params.day}. ` +
        `Focus on regional Indian variety. ` +
        `Return JSON array:[{name,emoji,time,diff,cal,protein,tags}]`
      );
    default:
      return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Request-Id"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const user = await verifyUser(req);
  if (!user) return unauthorized(res);

  const { type, useCredits, messages, ...params } = req.body || {};
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  // ── CHAT: always AI, no cache, plain-text reply ──────────────────
  if (type === "chat") {
    return handleChat(req, res, user, messages, useCredits, requestId);
  }

  if (!FREE_DAILY_LIMITS.hasOwnProperty(type)) {
    return res.status(400).json({ error: `Unknown feature type: ${type}` });
  }

  // ── CACHE CHECK (skips wallet entirely on a hit - no AI cost) ────
  try {
    const cached = await checkCache(type, params);
    if (cached !== null) {
      const wallet = await getWallet(user.id);
      return res.status(200).json({
        result: cached,
        wallet,
        source: "cache",
        request_id: requestId,
      });
    }
  } catch (e) {
    console.error("Cache check failed (continuing to AI):", e.message);
  }

  // ── DB-SEARCH FIRST for recipe_search (not a simple key lookup) ──
  if (type === "recipe_search") {
    try {
      const dbResults = await cache.searchRecipesByIngredients(
        params.ingredients || []
      );
      if (dbResults.length >= 3) {
        const wallet = await getWallet(user.id);
        return res.status(200).json({
          result: dbResults,
          wallet,
          source: "db",
          request_id: requestId,
        });
      }
    } catch (e) {
      console.error("DB ingredient search failed (continuing to AI):", e.message);
    }
  }

  // ── CACHE MISS: full wallet-gated AI flow ────────────────────────
  const prompt = buildPrompt(type, params);
  if (!prompt) {
    return res.status(400).json({ error: `Could not build prompt for type: ${type}` });
  }

  let reservedCredits = 0;
  let usedFreeAllowance = false;
  let isPlus = false;
  let usedAdBonus = false;

  try {
    isPlus = await isPlusSubscriber(user.id);
    const dailyLimit = isPlus ? PLUS_DAILY_LIMITS[type] : FREE_DAILY_LIMITS[type];
    usedFreeAllowance = await tryConsumeFreeUsage(user.id, type, dailyLimit);

    if (!usedFreeAllowance) {
      if (!useCredits) {
        const wallet = await getWallet(user.id);
        return res.status(402).json({
          error: "DAILY_LIMIT_REACHED",
          message: "Daily free limit reached for this feature.",
          wallet,
        });
      }
      // A verified rewarded ad grants one bonus action. Prefer that bonus
      // before spending purchased credits, while keeping the action server-side.
      const adBonusUsed = await consumeAdBonusAction(user.id);
      if (adBonusUsed) {
        usedFreeAllowance = false;
        reservedCredits = 0;
        usedAdBonus = true;
      } else {
        const estTotalTokens = 500 + MAX_OUTPUT_TOKENS[type];
        reservedCredits = creditsForTokens(estTotalTokens);
      }
      if (reservedCredits > 0) {
       try {
        await reserveCredits(user.id, reservedCredits);
      } catch (e) {
        if (e.code === "INSUFFICIENT_CREDITS") {
          const wallet = await getWallet(user.id);
          return res.status(402).json({
            error: "INSUFFICIENT_CREDITS",
            message: "Not enough credits for this action.",
            wallet,
          });
        }
        throw e;
       }
      }
    }

    const groqKey = KEY_MAP[type] || process.env.GROQ_KEY;
    const providerRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS[type],
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
    const data = await providerRes.json();
    if (!providerRes.ok) {
      throw new Error(data?.error?.message || "Groq request failed");
    }

    const usage = data.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || inputTokens + outputTokens;
    const actualCredits = usedFreeAllowance ? 0 : creditsForTokens(totalTokens);
    const estimatedCostUsd = groqCostUsd(inputTokens, outputTokens);

    const wallet = await settleCredits(user.id, {
      reservedAmount: reservedCredits,
      actualAmount: actualCredits,
      requestId,
      featureType: type,
      provider: "groq",
      model: GROQ_MODEL,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd,
      wasFree: usedFreeAllowance || usedAdBonus,
      wasAdBonus: usedAdBonus,
    });

    const content = data.choices?.[0]?.message?.content;
    const result = extractJson(content);
    if (result === null) {
      throw new Error("AI returned an unparseable response.");
    }

    // ── Save to cache for next time (best-effort, never blocks) ────
    await saveToCache(type, params, result);

    return res
      .status(200)
      .json({ result, wallet, source: "ai", request_id: requestId });
  } catch (e) {
    if (reservedCredits > 0) {
      try { await releaseReservation(user.id, reservedCredits); } catch (_) {}
    }
    if (usedAdBonus) {
      try { await restoreAdBonusAction(user.id); } catch (_) {}
    }
    if (usedFreeAllowance) {
      try { await releaseFreeUsage(user.id, "chat"); } catch (_) {}
    }
    return res.status(500).json({ error: e.message || "Request failed" });
  }
};

async function checkCache(type, params) {
  switch (type) {
    case "recipe_detail":
      return cache.getRecipeCache(params.recipe_name, params.servings);
    case "leftover":
      return cache.getLeftoverCache(ingredientsKey(params.ingredients || []));
    case "grocery":
      return cache.getGroceryCache(params.recipe_name);
    case "nutrition":
      return cache.getNutritionCache(params.food_name);
    default:
      return null; // recipe_search (handled separately), planner: no cache
  }
}

async function saveToCache(type, params, result) {
  try {
    switch (type) {
      case "recipe_detail":
        await cache.saveRecipeCache(params.recipe_name, params.servings, result);
        await cache.saveGeneratedRecipe(result);
        break;
      case "recipe_search":
        // individual AI-suggested recipes could be saved here too,
        // left out for now since they lack full ingredient/step
        // detail until someone actually opens one (which triggers
        // recipe_detail and saves the full version then).
        break;
      case "leftover":
        await cache.saveLeftoverCache(ingredientsKey(params.ingredients || []), result);
        break;
      case "grocery":
        await cache.saveGroceryCache(params.recipe_name, result);
        break;
      case "nutrition":
        await cache.saveNutritionCache(params.food_name, result);
        break;
    }
  } catch (e) {
    console.error("saveToCache failed (non-fatal):", e.message);
  }
}

function extractJson(text) {
  if (!text) return null;
  const clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const start = clean.search(/[[{]/);
  if (start === -1) return null;
  try {
    return JSON.parse(clean.slice(start));
  } catch (_) {
    return null;
  }
}

async function handleChat(req, res, user, messages, useCredits, requestId) {
  let reservedCredits = 0;
  let usedFreeAllowance = false;
  let usedAdBonus = false;

  try {
    const isPlus = await isPlusSubscriber(user.id);
    const dailyLimit = isPlus ? PLUS_DAILY_LIMITS.chat : FREE_DAILY_LIMITS.chat;
    usedFreeAllowance = await tryConsumeFreeUsage(user.id, "chat", dailyLimit);

    if (!usedFreeAllowance) {
      if (!useCredits) {
        const wallet = await getWallet(user.id);
        return res.status(402).json({
          error: "DAILY_LIMIT_REACHED",
          message: isPlus
            ? "Your Plus AI allowance for today is used up."
            : "Daily free chat limit reached.",
          wallet,
        });
      }

      const adBonusUsed = await consumeAdBonusAction(user.id);
      if (adBonusUsed) {
        usedAdBonus = true;
      } else {
        reservedCredits = creditsForTokens(500 + MAX_OUTPUT_TOKENS.chat);
        try {
          await reserveCredits(user.id, reservedCredits);
        } catch (e) {
          if (e.code === "INSUFFICIENT_CREDITS") {
            const wallet = await getWallet(user.id);
            return res.status(402).json({
              error: "INSUFFICIENT_CREDITS",
              message: "Not enough credits for this action.",
              wallet,
            });
          }
          throw e;
        }
      }
    }

    const providerRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_KEY_CHAT || process.env.GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: MAX_OUTPUT_TOKENS.chat,
          messages: [
            {
              role: "system",
              content:
                "You are CookMate Assistant, a friendly cooking and nutrition helper. Keep answers concise and practical.",
            },
            ...(messages || []),
          ],
        }),
      }
    );
    const data = await providerRes.json();
    if (!providerRes.ok) {
      throw new Error(data?.error?.message || "Groq request failed");
    }

    const usage = data.usage || {};
    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || inputTokens + outputTokens;
    const actualCredits = usedFreeAllowance ? 0 : creditsForTokens(totalTokens);
    const estimatedCostUsd = groqCostUsd(inputTokens, outputTokens);

    const wallet = await settleCredits(user.id, {
      reservedAmount: reservedCredits,
      actualAmount: actualCredits,
      requestId,
      featureType: "chat",
      provider: "groq",
      model: GROQ_MODEL,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd,
      wasFree: usedFreeAllowance || usedAdBonus,
      wasAdBonus: usedAdBonus,
    });

    const reply = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply, wallet, request_id: requestId });
  } catch (e) {
    if (reservedCredits > 0) {
      try { await releaseReservation(user.id, reservedCredits); } catch (_) {}
    }
    if (usedAdBonus) {
      try { await restoreAdBonusAction(user.id); } catch (_) {}
    }
    if (usedFreeAllowance) {
      try { await releaseFreeUsage(user.id, "chat"); } catch (_) {}
    }
    return res.status(500).json({ error: e.message || "Chat request failed" });
  }
}
