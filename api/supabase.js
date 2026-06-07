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
   const { type, category, state, cuisine, endpoint } = req.body;
    let url = "";
    if(type === "category") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state&limit=30&offset=${Math.floor(Math.random()*100)}`;
    } else if(type === "state") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state&state=eq.${encodeURIComponent(state)}&limit=30`;
    } else if(type === "cuisine") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,cuisine&limit=30&offset=${Math.floor(Math.random()*500)}`;
    } else {
      url = `${supabaseUrl}${endpoint || "/rest/v1/recipes?select=id,name,ingredients,minutes,nutrition,category,state&limit=100"}`;
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