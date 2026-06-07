const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY;
    const { type, ingredients, category, state, cuisine, endpoint } = req.body;

    let url = "";
    if(type === "category") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,emoji,minutes,difficulty,nutrition,category,state&category=ilike.*${encodeURIComponent(category)}*&limit=30`;
    } else if(type === "state") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,emoji,minutes,difficulty,nutrition,category,state&state=ilike.*${encodeURIComponent(state)}*&limit=30`;
    } else if(type === "cuisine") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,emoji,minutes,difficulty,nutrition,category,cuisine&cuisine=ilike.*${encodeURIComponent(cuisine)}*&limit=30`;
    } else {
      url = `${supabaseUrl}${endpoint || "/rest/v1/recipes?select=id,name,ingredients,emoji,minutes,difficulty,nutrition&limit=100"}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};