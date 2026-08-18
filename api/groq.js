const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { type, ...body } = req.body;

    // Use the new Groq model for all requests
    body.model = "openai/gpt-oss-120b";

    const keyMap = {
      chat: process.env.GROQ_KEY_CHAT,
      leftover: process.env.GROQ_KEY_LEFTOVER,
      planner: process.env.GROQ_KEY_PLANNER,
      recipe: process.env.GROQ_KEY_RECIPE,
    };

    const groqKey = keyMap[type] || process.env.GROQ_KEY;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
