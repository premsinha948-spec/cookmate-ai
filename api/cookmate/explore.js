const { verifyUser, unauthorized } = require("../../lib/auth");
const { getRecipesByState, getRecipesByCuisine } = require("../../lib/supabaseCache");

// Mirrors the original app's ExploreIndia/WorldCuisines "live
// enrichment" queries (originally two of many types inside the
// catch-all, unauthenticated api/supabase.js). Split out here with a
// real auth check, and with the original's cuisine-filter bug fixed
// (see getRecipesByCuisine's doc comment in lib/supabaseCache.js).
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  const user = await verifyUser(req);
  if (!user) return unauthorized(res);

  const { type, value } = req.query;
  if (!type || !value) {
    return res.status(400).json({ error: "Missing type or value" });
  }

  try {
    let recipes = [];
    if (type === "state") {
      recipes = await getRecipesByState(value);
    } else if (type === "cuisine") {
      recipes = await getRecipesByCuisine(value);
    } else {
      return res.status(400).json({ error: `Unknown type: ${type}` });
    }
    return res.status(200).json({ recipes });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Explore query failed" });
  }
};
