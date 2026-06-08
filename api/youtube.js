const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { q } = req.query;
    const key = process.env.REACT_APP_YOUTUBE_KEY || process.env.YOUTUBE_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q+" recipe")}&type=video&maxResults=4&key=${key}&regionCode=IN`;
    const r = await fetch(url);
    const d = await r.json();
    res.status(200).json(d);
  } catch(e) {
    res.status(500).json({error:e.message});
  }
};