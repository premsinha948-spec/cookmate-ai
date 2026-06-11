module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[Gemini] No API key found");
    return res.status(500).json({ ingredients: [], notes: "Server config error" });
  }

  const model = "gemini-3.1-flash-lite";
  console.log(`[Gemini] Using model: ${model}`);

  try {
    const { base64, mimeType } = req.body;
    if (!base64) return res.status(400).json({ ingredients: [], notes: "No image provided" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || "image/jpeg", data: base64 } },
            { text: 'List all food ingredients visible in this image. Return ONLY this JSON:\n{"ingredients":[{"name":"tomato","emoji":"🍅","confidence":"high"}],"notes":"description"}' }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 600 }
      }),
    });

    console.log(`[Gemini] Response status: ${response.status}`);

    const data = await response.json();

    if (data.error) {
      console.error("[Gemini] API Error:", data.error.message);
      if (data.error.message?.includes("quota") || data.error.message?.includes("limit")) {
        return res.status(200).json({ ingredients: [], notes: "quota_exceeded" });
      }
      return res.status(200).json({ ingredients: [], notes: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    console.log(`[Gemini] Raw response length: ${text.length}`);

    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("{");
    const result = start !== -1 ? JSON.parse(clean.slice(start)) : { ingredients: [], notes: "Parse failed" };
    return res.status(200).json(result);

  } catch (e) {
    console.error("[Gemini] Server error:", e.message);
    return res.status(500).json({ ingredients: [], notes: "Server error: " + e.message });
  }
};