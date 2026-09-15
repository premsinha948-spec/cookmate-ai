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
  GEMINI_MODEL,
  creditsForTokens,
} = require("../../lib/config");

const FEATURE_TYPE = "image_scan";

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

  // Expect { useCredits?: boolean, contents: [...] } - `contents`
  // matches the Gemini generateContent request body shape (with the
  // image as inline_data base64), built client-side and simply
  // forwarded here so the API key never leaves the server.
  const { useCredits, ...geminiBody } = req.body || {};
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  let reservedCredits = 0;
  let usedFreeAllowance = false;
  let isPlus = false;
  let usedAdBonus = false;

  try {
    isPlus = await isPlusSubscriber(user.id);
    const dailyLimit = isPlus ? PLUS_DAILY_LIMITS[FEATURE_TYPE] : FREE_DAILY_LIMITS[FEATURE_TYPE];
    usedFreeAllowance = await tryConsumeFreeUsage(user.id, FEATURE_TYPE, dailyLimit);

    if (!usedFreeAllowance) {
      if (!useCredits) {
        const wallet = await getWallet(user.id);
        return res.status(402).json({
          error: "DAILY_LIMIT_REACHED",
          message: "Daily free scan limit reached.",
          wallet,
        });
      }
      const adBonusUsed = await consumeAdBonusAction(user.id);
      if (adBonusUsed) {
        usedAdBonus = true;
        reservedCredits = 0;
      } else {
        const estTotalTokens = 500 + MAX_OUTPUT_TOKENS[FEATURE_TYPE];
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

    const geminiKey = process.env.GEMINI_API_KEY;
    const providerRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );
    const data = await providerRes.json();

    if (!providerRes.ok) {
      throw new Error(data?.error?.message || "Gemini request failed");
    }

    // Gemini returns usage under `usageMetadata`, not `usage` - use
    // the provider's real counts rather than estimating.
    const usage = data.usageMetadata || {};
    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const totalTokens = usage.totalTokenCount || inputTokens + outputTokens;
    const actualCredits = usedFreeAllowance ? 0 : creditsForTokens(totalTokens);

    // NOTE: Gemini pricing isn't in the spec's cost-tracking section
    // (only Groq's is) - estimated_provider_cost is left at 0 here
    // until you confirm the Gemini 3.1 Flash Lite rate to track it
    // accurately. Token counts and credit deduction are still exact.
    const wallet = await settleCredits(user.id, {
      reservedAmount: reservedCredits,
      actualAmount: actualCredits,
      requestId,
      featureType: FEATURE_TYPE,
      provider: "gemini",
      model: GEMINI_MODEL,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUsd: 0,
      wasFree: usedFreeAllowance || usedAdBonus,
      wasAdBonus: usedAdBonus,
    });

    return res.status(200).json({ data, wallet, request_id: requestId });
  } catch (e) {
    if (reservedCredits > 0) {
      try { await releaseReservation(user.id, reservedCredits); } catch (_) {}
    }
    if (usedAdBonus) {
      try { await restoreAdBonusAction(user.id); } catch (_) {}
    }
    if (usedFreeAllowance) {
      try { await releaseFreeUsage(user.id, FEATURE_TYPE); } catch (_) {}
    }
    return res.status(500).json({ error: e.message || "Request failed" });
  }
};
