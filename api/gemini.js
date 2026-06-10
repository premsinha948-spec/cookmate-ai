module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { base64, mimeType } = req.body;
    const key = process.env.REACT_APP_GEMINI_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || "image/jpeg", data: base64 } },
            { text: "List ONLY food ingredients visible in this image. Be specific. Return JSON: {ingredients:[{name,emoji,confidence}],notes:string}. If no food visible return {ingredients:[],notes:'No food detected'}. Return ONLY valid JSON, no markdown." }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
      }),
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("{");
    const result = start !== -1 ? JSON.parse(clean.slice(start)) : { ingredients: [], notes: "Could not parse response" };
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};