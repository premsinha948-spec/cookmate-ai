module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { base64, mimeType } = req.body;
    const key = process.env.REACT_APP_GEMINI_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || "image/jpeg", data: base64 } },
            { text: 'Look at this image carefully. List all food ingredients you can see. Respond with ONLY this JSON format, nothing else:\n{"ingredients":[{"name":"tomato","emoji":"🍅","confidence":"high"}],"notes":"found 3 items"}' }
          ]
        }],
        generationConfig: { 
          temperature: 0.1, 
          maxOutputTokens: 500,
          
        }
      }),
    });
    const data = await response.json();
    if(data.error) {
      return res.status(200).json({ingredients:[], notes: data.error.message});
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    try {
      const clean = text.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();
      const start = clean.indexOf("{");
      const result = start !== -1 ? JSON.parse(clean.slice(start)) : {ingredients:[],notes:"No food detected"};
      res.status(200).json(result);
    } catch {
      res.status(200).json({ingredients:[],notes:"Could not detect ingredients"});
    }
  } catch (e) {
    res.status(500).json({error: e.message, ingredients:[], notes:"Server error"});
  }
};