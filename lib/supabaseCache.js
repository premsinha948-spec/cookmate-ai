const { getSupabaseAdmin } = require("./supabaseAdmin");

// ============================================================
// Mirrors the original app's cache-first strategy (api/supabase.js's
// get_recipe_cache / save_recipe_cache / etc. operation types, and
// SB.searchByIngredients). Ported so the Flutter rewrite gets the
// same "check DB first, only call AI on a miss" cost savings the
// original app had.
// ============================================================

async function getRecipeCache(recipeName, servings) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("recipe_cache")
    .select("recipe_data")
    .eq("recipe_name", recipeName)
    .eq("servings", servings)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  try {
    return typeof data.recipe_data === "string"
      ? JSON.parse(data.recipe_data)
      : data.recipe_data;
  } catch (_) {
    return null;
  }
}

async function saveRecipeCache(recipeName, servings, recipeData) {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from("recipe_cache").insert({
      recipe_name: recipeName,
      servings,
      recipe_data: JSON.stringify(recipeData),
    });
  } catch (e) {
    console.error("saveRecipeCache failed (non-fatal):", e.message);
  }
}

async function getGroceryCache(recipeName) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("grocery_cache")
    .select("grocery_data")
    .eq("recipe_name", recipeName)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  try {
    return typeof data.grocery_data === "string"
      ? JSON.parse(data.grocery_data)
      : data.grocery_data;
  } catch (_) {
    return null;
  }
}

async function saveGroceryCache(recipeName, groceryData) {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from("grocery_cache").insert({
      recipe_name: recipeName,
      grocery_data: JSON.stringify(groceryData),
    });
  } catch (e) {
    console.error("saveGroceryCache failed (non-fatal):", e.message);
  }
}

async function getLeftoverCache(ingredientsKey) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leftover_cache")
    .select("recipes_data")
    .eq("ingredients_key", ingredientsKey)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  try {
    return typeof data.recipes_data === "string"
      ? JSON.parse(data.recipes_data)
      : data.recipes_data;
  } catch (_) {
    return null;
  }
}

async function saveLeftoverCache(ingredientsKey, recipesData) {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from("leftover_cache").insert({
      ingredients_key: ingredientsKey,
      recipes_data: JSON.stringify(recipesData),
    });
  } catch (e) {
    console.error("saveLeftoverCache failed (non-fatal):", e.message);
  }
}

async function getNutritionCache(foodName) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("nutrition_cache")
    .select("nutrition_data")
    .eq("food_name", foodName)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  try {
    return typeof data.nutrition_data === "string"
      ? JSON.parse(data.nutrition_data)
      : data.nutrition_data;
  } catch (_) {
    return null;
  }
}

async function saveNutritionCache(foodName, nutritionData) {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from("nutrition_cache").insert({
      food_name: foodName,
      nutrition_data: JSON.stringify(nutritionData),
    });
  } catch (e) {
    console.error("saveNutritionCache failed (non-fatal):", e.message);
  }
}

/**
 * Ingredient-based recipe search against the main `recipes` table.
 *
 * IMPROVEMENT over the original app: the original fetched a flat
 * `limit=200` slice of the table (out of 10,921 rows) and matched
 * client-side - meaning most searches never even saw ~98% of the
 * table. This instead uses Postgres `ilike` filters to search the
 * WHOLE table for rows whose `ingredients` text mentions any of the
 * given ingredients, then ranks by match count - same scoring idea
 * as the original, applied to the real dataset instead of a random
 * slice of it. Tell me if you'd rather match the original's exact
 * (weaker) behavior for some reason.
 */
async function searchRecipesByIngredients(ingredients, limit = 6) {
  const supabase = getSupabaseAdmin();
  const terms = ingredients
    .map((i) => i.replace(/^[^\w]*/, "").trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) return [];

  const orFilter = terms
    .map((t) => `ingredients.ilike.%${t.replace(/[%,]/g, "")}%`)
    .join(",");

  const { data, error } = await supabase
    .from("recipes")
    .select("id,name,minutes,nutrition,category,ingredients,tags")
    .or(orFilter)
    .limit(50);

  if (error || !data) return [];

  const scored = data.map((r) => {
    const rIngs = Array.isArray(r.ingredients)
      ? r.ingredients.map((i) => String(i).toLowerCase())
      : String(r.ingredients || "").toLowerCase().split(",");
    const hits = terms.filter((t) =>
      rIngs.some((ri) => ri.includes(t) || t.includes(ri))
    );
    return {
      name: r.name,
      emoji: "🍽️",
      time: r.minutes ? `${r.minutes} min` : "30 min",
      diff: "Medium",
      cal: r.nutrition?.calories || 320,
      protein: r.nutrition?.protein || "12g",
      tags: r.tags || [],
      matchScore: rIngs.length ? hits.length / rIngs.length : 0,
    };
  });

  return scored
    .filter((r) => r.matchScore >= 0.3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/** Auto-saves an AI-generated recipe into the main table for future
 * DB hits, mirroring the original app's `SB.saveRecipe`. */
async function saveGeneratedRecipe(recipe) {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from("recipes").insert({
      name: recipe.name,
      cuisine: recipe.cuisine || "Indian",
      category: recipe.category || recipe.tags?.[0] || "General",
      ingredients: (recipe.ingredients || []).map((i) =>
        typeof i === "string" ? i : i.item
      ),
      steps: recipe.steps || [],
      nutrition: recipe.nutrition || {},
      minutes: parseInt(recipe.time) || 30,
      source: "ai_generated",
    });
  } catch (e) {
    console.error("saveGeneratedRecipe failed (non-fatal):", e.message);
  }
}

async function getVideoCache(recipeName) {
  const supabase = getSupabaseAdmin();
  const cacheKey = recipeName.toLowerCase().trim();
  const { data, error } = await supabase
    .from("video_cache")
    .select("videos")
    .eq("recipe_name", cacheKey)
    .limit(1)
    .maybeSingle();
  if (error || !data || !data.videos) return null;
  try {
    return typeof data.videos === "string" ? JSON.parse(data.videos) : data.videos;
  } catch (_) {
    return null;
  }
}

async function saveVideoCache(recipeName, videos) {
  const supabase = getSupabaseAdmin();
  const cacheKey = recipeName.toLowerCase().trim();
  try {
    await supabase.from("video_cache").insert({
      recipe_name: cacheKey,
      videos: JSON.stringify(videos),
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("saveVideoCache failed (non-fatal):", e.message);
  }
}

/** Live-enrichment for Explore India: extra recipes from the main
 * `recipes` table matching a given state, appended to the static
 * ported list. Mirrors the original's `type: "state"` query. */
async function getRecipesByState(state, limit = 30) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("recipes")
    .select("id,name,minutes,nutrition,category,state")
    .eq("state", state)
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    name: r.name,
    emoji: "🍽️",
    time: r.minutes ? `${r.minutes} min` : "30 min",
    diff: "Medium",
    cal: r.nutrition?.calories || 320,
    protein: r.nutrition?.protein || "12g",
    tags: [r.category || "Indian"],
  }));
}

/** Live-enrichment for World Cuisines: extra recipes matching a given
 * cuisine/country. NOTE: the original app's equivalent query
 * (`type: "cuisine"`) had a bug - it never actually filtered by the
 * `cuisine` parameter it received, just returned 30 random recipes
 * regardless of country. Fixed here to actually filter, since keeping
 * the bug would show irrelevant recipes under every country. */
async function getRecipesByCuisine(cuisine, limit = 30) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("recipes")
    .select("id,name,minutes,nutrition,category,cuisine")
    .eq("cuisine", cuisine)
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    name: r.name,
    emoji: "🍽️",
    time: r.minutes ? `${r.minutes} min` : "30 min",
    diff: "Medium",
    cal: r.nutrition?.calories || 320,
    protein: r.nutrition?.protein || "12g",
    tags: [r.category || "World"],
  }));
}

module.exports = {
  getRecipeCache,
  saveRecipeCache,
  getGroceryCache,
  saveGroceryCache,
  getLeftoverCache,
  saveLeftoverCache,
  getNutritionCache,
  saveNutritionCache,
  searchRecipesByIngredients,
  saveGeneratedRecipe,
  getVideoCache,
  saveVideoCache,
  getRecipesByState,
  getRecipesByCuisine,
};
