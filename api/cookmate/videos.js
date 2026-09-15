const fetch = require("node-fetch");
const { verifyUser, unauthorized } = require("../../lib/auth");
const { getVideoCache, saveVideoCache } = require("../../lib/supabaseCache");

// Mirrors the original app's `getVideos(recipeName)`: check
// `video_cache` first (an earlier search may have already saved up to
// 50 results for this recipe name) - only call the YouTube Data API
// on a genuine miss, then cache all 50 results for next time. No
// wallet/credit cost - this isn't a Groq/Gemini call, just a search
// API with its own separate (free-tier) quota.
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  const user = await verifyUser(req);
  if (!user) return unauthorized(res);

  const { recipe_name: recipeName } = req.query;
  if (!recipeName) {
    return res.status(400).json({ error: "Missing recipe_name" });
  }

  try {
    const cached = await getVideoCache(recipeName);
    if (cached && cached.length) {
      return res.status(200).json({ videos: cached, source: "cache" });
    }

    const key = process.env.YOUTUBE_KEY || process.env.REACT_APP_YOUTUBE_KEY;
    if (!key) {
      return res.status(200).json({ videos: [], source: "none" });
    }

    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&` +
      `q=${encodeURIComponent(recipeName + " recipe")}&type=video&` +
      `maxResults=50&key=${key}&regionCode=IN&videoEmbeddable=true`;

    const r = await fetch(url);
    const d = await r.json();

    if (d.error || !d.items?.length) {
      return res.status(200).json({ videos: [], source: "none" });
    }

    const videos = d.items.map((i) => ({
      id: i.id.videoId,
      title: i.snippet.title,
      channel: i.snippet.channelTitle,
      thumb: `https://img.youtube.com/vi/${i.id.videoId}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${i.id.videoId}`,
    }));

    await saveVideoCache(recipeName, videos);

    return res.status(200).json({ videos, source: "live" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Video search failed" });
  }
};
