const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { type, ingredients, category, state, cuisine } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.REACT_APP_SUPABASE_KEY;

    let endpoint = "";
    if(type === "ingredients") {
      endpoint = `/rest/v1/recipes?select=id,name,ingredients,emoji,minutes,difficulty,nutrition,category,state&limit=100`;
    } else if(type === "category") {
      endpoint = `/rest/v1/recipes?select=id,name,ingredients,emoji,minutes,difficulty,nutrition,category,state&category=ilike.*${category}*&limit=30`;
    } else if(type === "state") {
      endpoint = `/rest/v1/recipes?select=id,name,ingredients,emoji,minutes,difficulty,nutrition,category,state&state=ilike.*${state}*&limit=30`;
    } else if(type === "cuisine") {
      endpoint = `/rest/v1/recipes?select=id,name,ingredients,emoji,minutes,difficulty,nutrition,category,cuisine&cuisine=ilike.*${cuisine}*&limit=30`;
    } else {
      endpoint = req.body.endpoint || `/rest/v1/recipes?select=*&limit=30`;
    }

    const url = `${supabaseUrl}${endpoint}`;
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