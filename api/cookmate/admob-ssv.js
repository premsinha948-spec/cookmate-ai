const { getSupabaseAdmin } = require("../../lib/supabaseAdmin");
const { verifyAdMobSsvRequest } = require("../../lib/admobVerify");
const { AD_REWARD_CREDITS } = require("../../lib/config");

// This is the URL you register in the AdMob console as the "Server-
// side verification callback URL" for your rewarded ad unit, e.g.:
//   https://your-vercel-app.vercel.app/api/admob-ssv
// Google calls it directly (not through your Flutter app) with query
// params identifying the user, the reward, and a signature.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const params = req.query;
  const { user_id: userId, transaction_id: transactionId } = params;

  if (!userId || !transactionId) {
    return res.status(400).send("Missing required parameters");
  }

  // ── Signature check ──────────────────────────────────────────────
  const verified = await verifyAdMobSsvRequest(params, req.url);
  if (!verified) {
    console.warn(
      "AdMob SSV signature verification failed for transaction " +
        transactionId + " - no credits granted. If you just ran " +
        "AdMob's test SSV callback and expected success, see " +
        "lib/admobVerify.js's doc comment for debugging steps."
    );
    // Respond 200 so Google doesn't endlessly retry, but grant NOTHING.
    return res.status(200).send("Not verified - no reward granted.");
  }

  // ── Grant the reward (idempotent on transaction_id) ────────────────
  try {
    const supabase = getSupabaseAdmin();
    await supabase.rpc('grant_ad_bonus_action', { p_user_id: userId, p_reference_id: transactionId });
    return res.status(200).send("OK");
  } catch (e) {
    console.error("Failed to grant AdMob reward:", e);
    return res.status(500).send("Failed to grant reward");
  }
};
