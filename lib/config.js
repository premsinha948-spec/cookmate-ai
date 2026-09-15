// Centralized, server-side configuration. Mirrors the constants named
// in the spec (sections 12, 24, 10) so nothing is hardcoded per-file.

const FREE_DAILY_LIMITS = {
  recipe_detail: 2,
  recipe_search: 2,
  leftover: 2,
  grocery: 2,
  nutrition: 3,
  chat: 2,
  planner: 2,
  image_scan: 2,
};

const PLUS_DAILY_LIMITS = {
  recipe_detail: 10,
  recipe_search: 10,
  leftover: 10,
  grocery: 10,
  nutrition: 20,
  chat: 20,
  planner: 10,
  image_scan: 10,
};

const MAX_OUTPUT_TOKENS = {
  recipe_detail: 2500,
  recipe_search: 2000,
  leftover: 2500,
  grocery: 1500,
  nutrition: 1500,
  chat: 1200,
  planner: 2500,
  image_scan: 1500, // conservative default - revisit once Gemini's
                     // actual image-response token behavior is verified
};

// 1 credit = 1000 combined (input+output) tokens.
const TOKENS_PER_CREDIT = 1000;

// GPT-OSS-120B via Groq, per spec section 10. Update if Groq's
// published pricing changes.
const GROQ_PRICE_PER_MILLION_INPUT_USD = 0.15;
const GROQ_PRICE_PER_MILLION_OUTPUT_USD = 0.6;

// Configurable, not hardcoded elsewhere - update as the real rate
// changes. Consider fetching from a live source periodically instead.
const USD_TO_INR = 88;

const GROQ_MODEL = "openai/gpt-oss-120b";
const GEMINI_MODEL = "gemini-3.1-flash-lite"; // verified current as of Sep 2026

// Rewarded-ad bonus, granted as credits (not a literal "+1 action")
// since actions vary widely in token cost - see backend README for
// why this deviates from the spec's literal "+1 additional action"
// wording. Tune this to roughly cover one average recipe generation.
const AD_REWARD_CREDITS = 2.5;

function creditsForTokens(totalTokens) {
  return Math.round((totalTokens / TOKENS_PER_CREDIT) * 100) / 100; // 2dp
}

function groqCostUsd(inputTokens, outputTokens) {
  const inCost = (inputTokens / 1_000_000) * GROQ_PRICE_PER_MILLION_INPUT_USD;
  const outCost = (outputTokens / 1_000_000) * GROQ_PRICE_PER_MILLION_OUTPUT_USD;
  return inCost + outCost;
}

module.exports = {
  FREE_DAILY_LIMITS,
  MAX_OUTPUT_TOKENS,
  TOKENS_PER_CREDIT,
  GROQ_PRICE_PER_MILLION_INPUT_USD,
  GROQ_PRICE_PER_MILLION_OUTPUT_USD,
  USD_TO_INR,
  GROQ_MODEL,
  GEMINI_MODEL,
  AD_REWARD_CREDITS,
  PLUS_DAILY_LIMITS,
  creditsForTokens,
  groqCostUsd,
};
