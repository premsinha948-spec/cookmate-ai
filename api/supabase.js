const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { endpoint, method="GET", body } = req.body;
    const url = `${process.env.REACT_APP_SUPABASE_URL}${endpoint}`;
    console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL ? "SET" : "NOT SET");
    console.log("Supabase KEY:", process.env.REACT_APP_SUPABASE_KEY ? "SET" : "NOT SET");
    console.log("Fetching:", url);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.REACT_APP_SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    console.log("Supabase status:", response.status);
    res.status(200).json(data);
  } catch (e) {
    console.log("Supabase error:", e.message);
    res.status(500).json({ error: e.message });
  }
};