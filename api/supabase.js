const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.REACT_APP_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.REACT_APP_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: "Supabase environment variables are missing.",
      });
    }

    const {
      type,
      category,
      state,
      cuisine,
      user_id,
      recipes,
      recipe_name,
      servings,
      ingredients,
      day,
      mealType,
      recipesData,
    } = req.body || {};

    const headers = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    async function supabaseRequest(
      path,
      method = "GET",
      requestBody = undefined,
      extraHeaders = {}
    ) {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/${path}`,
        {
          method,
          headers: {
            ...headers,
            ...extraHeaders,
          },
          body: requestBody,
        }
      );

      const text = await response.text();

      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = {
            raw: text,
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error_description ||
            data?.hint ||
            data?.error ||
            `Supabase request failed (${response.status})`
        );
      }

      return data;
    }

    // ------------------------------------------------------------
    // CATEGORY
    // ------------------------------------------------------------
    if (type === "category") {
      const safeCategory = String(
        category || ""
      ).trim();

      const query =
        `recipes?select=*` +
        `&category=eq.${encodeURIComponent(
          safeCategory
        )}` +
        `&limit=30`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // STATE
    // ------------------------------------------------------------
    if (type === "state") {
      const safeState = String(
        state || ""
      ).trim();

      const query =
        `recipes?select=*` +
        `&state=eq.${encodeURIComponent(
          safeState
        )}` +
        `&limit=30`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // CUISINE
    // ------------------------------------------------------------
    if (type === "cuisine") {
      const safeCuisine = String(
        cuisine || ""
      ).trim();

      const query =
        `recipes?select=*` +
        `&cuisine=eq.${encodeURIComponent(
          safeCuisine
        )}` +
        `&limit=30`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // AI PICKS
    // ------------------------------------------------------------
    if (type === "ai_picks") {
      const query =
        `ai_picks?select=*` +
        `&user_id=eq.${encodeURIComponent(
          user_id
        )}` +
        `&order=generated_at.desc` +
        `&limit=1`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // RECIPE HISTORY
    // ------------------------------------------------------------
    if (type === "recipe_history") {
      const fourDaysAgo = new Date(
        Date.now() -
          4 * 24 * 60 * 60 * 1000
      ).toISOString();

      const query =
        `user_recipe_history?select=recipe_name` +
        `&user_id=eq.${encodeURIComponent(
          user_id
        )}` +
        `&shown_at=gte.${encodeURIComponent(
          fourDaysAgo
        )}`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // RECIPE POOL
    // ------------------------------------------------------------
    if (type === "recipe_pool") {
      const query =
        `recipe_pool?select=*` +
        `&limit=100` +
        `&offset=${Math.floor(
          Math.random() * 50
        )}`;

      const data =
        await supabaseRequest(query);

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // SAVE PICKS
    // ------------------------------------------------------------
    if (type === "save_picks") {
      await supabaseRequest(
        `ai_picks?user_id=eq.${encodeURIComponent(
          user_id
        )}`,
        "DELETE"
      );

      const data =
        await supabaseRequest(
          "ai_picks",
          "POST",
          JSON.stringify({
            user_id,
            recipes: JSON.stringify(
              recipes || []
            ),
            generated_at:
              new Date().toISOString(),
          }),
          {
            Prefer: "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // SAVE RECIPE POOL
    // ------------------------------------------------------------
    if (type === "save_pool") {
      const rows = (
        recipes || []
      ).map((r) => ({
        name: r.name,
        emoji: r.emoji || "🍽️",
        time: r.time || "30 min",
        diff: r.diff || "Medium",
        cal: r.cal || 320,
        protein:
          r.protein || "12g",
        tags: r.tags || [],
        category:
          r.category || "General",
      }));

      const data =
        await supabaseRequest(
          "recipe_pool",
          "POST",
          JSON.stringify(rows),
          {
            Prefer: "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // SAVE HISTORY
    // ------------------------------------------------------------
    if (type === "save_history") {
      const rows = (
        recipes || []
      ).map((r) => ({
        user_id,
        recipe_name: r.name,
        shown_at:
          new Date().toISOString(),
      }));

      const data =
        await supabaseRequest(
          "user_recipe_history",
          "POST",
          JSON.stringify(rows),
          {
            Prefer: "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // RECIPE SEARCH FROM 10K+ SUPABASE RECIPES
    // ------------------------------------------------------------
    if (type === "recipe_search") {
      const inputIngredients =
        Array.isArray(ingredients)
          ? ingredients
          : [];

      const cleanIngredients =
        inputIngredients
          .map((item) =>
            String(item)
              .replace(/^[^\w]+/g, "")
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
          .slice(0, 15);

      if (
        cleanIngredients.length === 0
      ) {
        return res.status(200).json({
          result: [],
          source: "supabase",
        });
      }

      const recipeMap = new Map();

      for (const ingredient of cleanIngredients) {
        const encoded =
          encodeURIComponent(
            `*${ingredient}*`
          );

        const query =
          `recipes?select=*` +
          `&or=(ingredients.ilike.${encoded},name.ilike.${encoded})` +
          `&limit=100`;

        try {
          const rows =
            await supabaseRequest(
              query
            );

          for (const row of Array.isArray(
            rows
          )
            ? rows
            : []) {
            if (row?.id != null) {
              recipeMap.set(
                String(row.id),
                row
              );
            }
          }
        } catch (_) {
          // Continue with remaining ingredients.
        }
      }

      const scored = [];

      for (const recipe of recipeMap.values()) {
        const raw = String(
          recipe.ingredients || ""
        ).toLowerCase();

        let hits = 0;

        for (const ingredient of cleanIngredients) {
          if (raw.includes(ingredient)) {
            hits++;
          }
        }

        if (hits === 0) {
          const name = String(
            recipe.name || ""
          ).toLowerCase();

          for (const ingredient of cleanIngredients) {
            if (
              name.includes(ingredient)
            ) {
              hits++;
            }
          }
        }

        const score =
          hits /
          cleanIngredients.length;

        if (score >= 0.3) {
          scored.push({
            recipe,
            score,
            hits,
          });
        }
      }

      scored.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return b.hits - a.hits;
      });

      const result = scored
        .slice(0, 10)
        .map((item) => item.recipe);

      return res.status(200).json({
        result,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // MEAL PLANNER
    //
    // Flow:
    //
    // 1. Supabase recipes table
    // 2. planner_cache if DB has no result
    // 3. Flutter calls Groq if both miss
    // ------------------------------------------------------------
    if (type === "planner") {
      const cleanDay =
        String(
          day || "Monday"
        ).trim();

      const cleanMeal =
        String(
          mealType || "Breakfast"
        ).trim();

      const meal =
        cleanMeal.toLowerCase();

      const cacheKey =
        `${cleanDay}|${cleanMeal}`.toLowerCase();

      let categoryGroups = [];

      // BREAKFAST
      if (
        meal.includes("breakfast")
      ) {
        categoryGroups = [
          {
            categories: [
              "Breakfast",
              "breakfast",
            ],
            limit: 25,
          },
          {
            categories: [
              "Beverage",
              "beverage",
            ],
            limit: 5,
          },
        ];
      }

      // SNACKS
      else if (
        meal.includes("snack") ||
        meal.includes("evening")
      ) {
        categoryGroups = [
          {
            categories: [
              "Snack",
              "snack",
            ],
            limit: 25,
          },
          {
            categories: [
              "Beverage",
              "beverage",
            ],
            limit: 5,
          },
        ];
      }

      // LUNCH / DINNER
      else {
        categoryGroups = [
          {
            categories: [
              "Main Course",
              "main course",
            ],
            limit: 25,
          },
          {
            categories: [
              "Side",
              "side",
            ],
            limit: 12,
          },
          {
            categories: [
              "Starter",
              "starter",
            ],
            limit: 8,
          },
          {
            categories: [
              "Dessert",
              "dessert",
            ],
            limit: 8,
          },
          {
            categories: [
              "Beverage",
              "beverage",
            ],
            limit: 5,
          },
        ];
      }

      // ----------------------------------------------------------
      // 1. FIRST: GET RECIPES FROM MAIN RECIPES TABLE
      // ----------------------------------------------------------

      const rows = [];

      for (const group of categoryGroups) {
        for (const categoryValue of group.categories) {
          const query =
            `recipes?select=*` +
            `&category=eq.${encodeURIComponent(
              categoryValue
            )}` +
            `&limit=${group.limit}`;

          try {
            const data =
              await supabaseRequest(
                query
              );

            if (
              Array.isArray(data)
            ) {
              rows.push(...data);
            }
          } catch (_) {
            // Continue with next category.
          }
        }
      }

      // ----------------------------------------------------------
      // REMOVE DUPLICATES
      // ----------------------------------------------------------

      const unique = new Map();

      for (const row of rows) {
        if (row?.id != null) {
          unique.set(
            String(row.id),
            row
          );
        }
      }

      let result =
        Array.from(
          unique.values()
        );

      // ----------------------------------------------------------
      // IF MAIN RECIPES FOUND
      // ----------------------------------------------------------

      if (result.length > 0) {
        result.sort(
          () => Math.random() - 0.5
        );

        result =
          result.slice(0, 10);

        return res.status(200).json({
          result,
          source: "supabase",
          day: cleanDay,
          mealType: cleanMeal,
        });
      }

      // ----------------------------------------------------------
      // 2. MAIN DB EMPTY → CHECK PLANNER CACHE
      // ----------------------------------------------------------

      try {
        const cacheQuery =
          `planner_cache?select=*` +
          `&cache_key=eq.${encodeURIComponent(
            cacheKey
          )}` +
          `&limit=1`;

        const cacheData =
          await supabaseRequest(
            cacheQuery
          );

        if (
          Array.isArray(
            cacheData
          ) &&
          cacheData.length > 0 &&
          Array.isArray(
            cacheData[0]
              .recipes_data
          )
        ) {
          return res.status(200).json({
            result:
              cacheData[0]
                .recipes_data,
            source: "cache",
            day: cleanDay,
            mealType: cleanMeal,
          });
        }
      } catch (_) {
        // Cache failure should not break planner.
      }

      // ----------------------------------------------------------
      // 3. EVERYTHING MISSED
      // Flutter will call Groq AI.
      // ----------------------------------------------------------

      return res.status(200).json({
        result: [],
        source: "miss",
        day: cleanDay,
        mealType: cleanMeal,
      });
    }

    // ------------------------------------------------------------
    // LEGACY INGREDIENTS
    // ------------------------------------------------------------
    // Kept for compatibility with old Flutter code.
    if (type === "ingredients") {
      const query =
        `recipes?select=*` +
        `&limit=1000`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result: data,
        source: "supabase",
      });
    }

    // ------------------------------------------------------------
    // RECIPE CACHE
    // ------------------------------------------------------------
    if (
      type === "get_recipe_cache"
    ) {
      const query =
        `recipe_cache?recipe_name=eq.${encodeURIComponent(
          recipe_name
        )}` +
        `&servings=eq.${encodeURIComponent(
          servings
        )}` +
        `&limit=1`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    if (
      type === "save_recipe_cache"
    ) {
      const data =
        await supabaseRequest(
          "recipe_cache",
          "POST",
          JSON.stringify({
            recipe_name,
            servings: parseInt(
              servings,
              10
            ),
            recipe_data:
              JSON.stringify(
                recipes || []
              ),
          }),
          {
            Prefer:
              "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // GROCERY CACHE
    // ------------------------------------------------------------
    if (
      type === "get_grocery_cache"
    ) {
      const query =
        `grocery_cache?recipe_name=eq.${encodeURIComponent(
          recipe_name
        )}` +
        `&limit=1`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    if (
      type === "save_grocery_cache"
    ) {
      const data =
        await supabaseRequest(
          "grocery_cache",
          "POST",
          JSON.stringify({
            recipe_name,
            grocery_data:
              JSON.stringify(
                recipes || []
              ),
          }),
          {
            Prefer:
              "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // LEFTOVER CACHE
    // ------------------------------------------------------------
    if (
      type === "get_leftover_cache"
    ) {
      const query =
        `leftover_cache?ingredients_key=eq.${encodeURIComponent(
          recipe_name
        )}` +
        `&limit=1`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    if (
      type === "save_leftover_cache"
    ) {
      const data =
        await supabaseRequest(
          "leftover_cache",
          "POST",
          JSON.stringify({
            ingredients_key:
              recipe_name,
            recipes_data:
              JSON.stringify(
                recipes || []
              ),
          }),
          {
            Prefer:
              "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // NUTRITION CACHE
    // ------------------------------------------------------------
    if (
      type === "get_nutrition_cache"
    ) {
      const query =
        `nutrition_cache?food_name=eq.${encodeURIComponent(
          recipe_name
        )}` +
        `&limit=1`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    if (
      type === "save_nutrition_cache"
    ) {
      const data =
        await supabaseRequest(
          "nutrition_cache",
          "POST",
          JSON.stringify({
            food_name:
              recipe_name,
            nutrition_data:
              JSON.stringify(
                recipes || []
              ),
          }),
          {
            Prefer:
              "return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        source: "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // PLANNER CACHE - GET
    // ------------------------------------------------------------
    if (
      type === "get_planner_cache"
    ) {
      const cleanDay =
        String(
          day || "Monday"
        ).trim();

      const cleanMeal =
        String(
          mealType || "Breakfast"
        ).trim();

      const cacheKey =
        `${cleanDay}|${cleanMeal}`.toLowerCase();

      const query =
        `planner_cache?select=*` +
        `&cache_key=eq.${encodeURIComponent(
          cacheKey
        )}` +
        `&limit=1`;

      const data =
        await supabaseRequest(
          query
        );

      return res.status(200).json({
        result:
          Array.isArray(data) &&
          data.length > 0
            ? data[0]
            : null,
        source:
          "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // PLANNER CACHE - SAVE
    // ------------------------------------------------------------
    if (
      type === "save_planner_cache"
    ) {
      const cleanDay =
        String(
          day || "Monday"
        ).trim();

      const cleanMeal =
        String(
          mealType || "Breakfast"
        ).trim();

      const cacheKey =
        `${cleanDay}|${cleanMeal}`.toLowerCase();

      const cacheRecipes =
        Array.isArray(
          recipesData
        )
          ? recipesData
          : [];

      if (
        cacheRecipes.length === 0
      ) {
        return res.status(200).json({
          result: null,
          ok: false,
          source:
            "supabase_cache",
        });
      }

      const data =
        await supabaseRequest(
          `planner_cache?on_conflict=cache_key`,
          "POST",
          JSON.stringify({
            cache_key:
              cacheKey,
            day: cleanDay,
            meal_type:
              cleanMeal,
            recipes_data:
              cacheRecipes,
          }),
          {
            Prefer:
              "resolution=merge-duplicates,return=minimal",
          }
        );

      return res.status(200).json({
        result: data,
        ok: true,
        source:
          "supabase_cache",
      });
    }

    // ------------------------------------------------------------
    // UNKNOWN OPERATION
    // ------------------------------------------------------------
    return res.status(400).json({
      error:
        `Unknown Supabase operation: ${
          type || "missing type"
        }`,
    });
  } catch (e) {
    console.error(
      "Supabase API error:",
      e
    );

    return res.status(500).json({
      error:
        e.message ||
        "Supabase request failed.",
    });
  }
};