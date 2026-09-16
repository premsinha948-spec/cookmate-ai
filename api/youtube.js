const fetch = require("node-fetch");
const { verifyUser, unauthorized } = require("../lib/auth");
const { getVideoCache, saveVideoCache } = require("../lib/supabaseCache");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  // Flutter/new app sends auth. Old React route may not.
  // Keep the route usable for the existing React app as well.
  let user = null;
  try {
    user = await verifyUser(req);
  } catch (_) {}

  const recipeName =
    req.query?.recipe_name ||
    req.query?.q ||
    "";

  if (!recipeName) {
    return res.status(400).json({
      error: "Missing recipe_name/q",
    });
  }

  try {
    // Cache only when we have an authenticated user.
    if (user) {
      const cached = await getVideoCache(recipeName);

      if (cached && cached.length) {
        return res.status(200).json({
          videos: cached,
          source: "cache",
        });
      }
    }

    const key = process.env.YOUTUBE_KEY || process.env.REACT_APP_YOUTUBE_KEY;

    if (!key) {
      return res.status(200).json({
        videos: [],
        source: "none",
      });
    }

    const url =
      "https://www.googleapis.com/youtube/v3/search?" +
      "part=snippet&" +
      `q=${encodeURIComponent(recipeName + " recipe")}&` +
      "type=video&" +
      "maxResults=50&" +
      "key=" +
      encodeURIComponent(key) +
      "&regionCode=IN&videoEmbeddable=true";

    const r = await fetch(url);
    const d = await r.json();

    if (!r.ok || d.error) {
      return res.status(200).json({
        videos: [],
        source: "none",
      });
    }

    const videos = (d.items || [])
      .filter((i) => i?.id?.videoId)
      .map((i) => ({
        id: i.id.videoId,
        title: i.snippet?.title || "",
        channel: i.snippet?.channelTitle || "",
        thumb: `https://img.youtube.com/vi/${i.id.videoId}/mqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${i.id.videoId}`,
      }));

    // Cache for Flutter/new backend flow.
    if (user && videos.length) {
      try {
        await saveVideoCache(recipeName, videos);
      } catch (_) {}
    }

    // Important: old React expects raw YouTube response.
    // New Flutter expects { videos: [...] }.
    const isNewFlutterRequest =
      Object.prototype.hasOwnProperty.call(req.query || {}, "recipe_name");

    if (isNewFlutterRequest) {
      return res.status(200).json({
        videos,
        source: "live",
      });
    }

    // Preserve existing React app behaviour.
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({
      error: e.message || "Video search failed",
    });
  }
};