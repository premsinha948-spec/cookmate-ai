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
 const offset = Math.floor(Math.random() * 200);
url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state,prep_time,cook_time&category=ilike.${encodeURIComponent(category)}&limit=30&offset=${offset}`;
    } else if(type === "state") {
    url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state,prep_time,cook_time&state=ilike.*${encodeURIComponent(state)}*&limit=30`;
    } else if(type === "cuisine") {
     url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,cuisine,prep_time,cook_time&cuisine=ilike.*${encodeURIComponent(cuisine)}*&limit=30`;
    } else {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,ingredients,minutes,nutrition,category,state,prep_time,cook_time&limit=100`;
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