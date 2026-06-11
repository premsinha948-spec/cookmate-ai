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
    const { type, category, state, cuisine, endpoint, user_id, recipes } = req.body;

    const headers = {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    };

    let url = "";
    let method = "GET";
    let body = undefined;

    if(type === "category") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state&limit=30&offset=${Math.floor(Math.random()*100)}`;
    } else if(type === "state") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,state&state=eq.${encodeURIComponent(state)}&limit=30`;
    } else if(type === "cuisine") {
      url = `${supabaseUrl}/rest/v1/recipes?select=id,name,minutes,nutrition,category,cuisine&limit=30&offset=${Math.floor(Math.random()*500)}`;
    } else if(type === "ai_picks") {
      url = `${supabaseUrl}/rest/v1/ai_picks?select=*&user_id=eq.${encodeURIComponent(user_id)}&order=generated_at.desc&limit=1`;
    } else if(type === "recipe_history") {
      const fourDaysAgo = new Date(Date.now() - 4*24*60*60*1000).toISOString();
      url = `${supabaseUrl}/rest/v1/user_recipe_history?select=recipe_name&user_id=eq.${encodeURIComponent(user_id)}&shown_at=gte.${fourDaysAgo}`;
    } else if(type === "recipe_pool") {
      url = `${supabaseUrl}/rest/v1/recipe_pool?select=*&limit=100&offset=${Math.floor(Math.random()*50)}`;
    } else if(type === "save_picks") {
      // Purane picks delete karo
      await fetch(`${supabaseUrl}/rest/v1/ai_picks?user_id=eq.${encodeURIComponent(user_id)}`, {
        method: "DELETE",
        headers,
      });
      url = `${supabaseUrl}/rest/v1/ai_picks`;
      method = "POST";
      body = JSON.stringify({user_id, recipes: JSON.stringify(recipes), generated_at: new Date().toISOString()});
      headers["Prefer"] = "return=minimal";
    } else if(type === "save_pool") {
      url = `${supabaseUrl}/rest/v1/recipe_pool`;
      method = "POST";
     body = JSON.stringify(recipes.map(r=>({name:r.name,emoji:r.emoji||"🍽️",time:r.time||"30 min",diff:r.diff||"Medium",cal:r.cal||320,protein:r.protein||"12g",tags:r.tags||[],category:r.category||"General"})));
      headers["Prefer"] = "return=minimal";
      headers["on_conflict"] = "name";
    } else if(type === "save_history") {
      url = `${supabaseUrl}/rest/v1/user_recipe_history`;
      method = "POST";
      body = JSON.stringify(recipes.map(r=>({user_id, recipe_name:r.name, shown_at:new Date().toISOString()})));
      headers["Prefer"] = "return=minimal";
    } else if(type === "ingredients") {
      url = `${supabaseUrl}/rest/v1/recipes?select=*&limit=200`;
    } else {
      url = `${supabaseUrl}${endpoint || "/rest/v1/recipes?select=id,name,ingredients,minutes,nutrition,category,state&limit=100"}`;
    }

    const response = await fetch(url, { method, headers, body });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};