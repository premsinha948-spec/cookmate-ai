const { verifyUser, unauthorized } = require("../../lib/auth");
const { getSupabaseAdmin } = require("../../lib/supabaseAdmin");

// Spec section 30: real account deletion, not just sign-out.
// - authenticate the caller (they can only ever delete THEIR OWN
//   account - never accept a target user_id from the client)
// - delete/anonymize associated data
// - revoke sessions (auth.admin.deleteUser does this - all of the
//   user's refresh tokens become invalid immediately)
// - clean up RevenueCat identity (best-effort; doesn't block deletion
//   if it fails)
// - Supabase service-role key stays server-side, never touches Flutter
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const user = await verifyUser(req);
  if (!user) return unauthorized(res);

  const supabase = getSupabaseAdmin();
  const userId = user.id;

  try {
    // ── 1. Delete app-data rows explicitly. ──────────────────────────
    // `auth.users` deletion below does NOT automatically cascade into
    // these tables unless you've set `on delete cascade` foreign keys
    // in your schema (the wallet/ledger/usage migration in this
    // delivery does use `on delete cascade` for user_id references,
    // so those are covered automatically - this loop is a safety net
    // for anything else, e.g. a `profiles` table from your original
    // app that this migration doesn't know about).
    const tablesToClean = ["profiles", "review_accounts"];
    for (const table of tablesToClean) {
      try {
        await supabase.from(table).delete().eq("user_id", userId);
      } catch (_) {
        // Table may not exist / may use a different column name in
        // your original schema - don't let that block the deletion.
      }
    }

    // ── 2. Best-effort RevenueCat cleanup. ───────────────────────────
    // Not deleting the RevenueCat customer record (RevenueCat doesn't
    // offer a simple "delete customer" REST call), but you may want to
    // call their API to detach/anonymize if your compliance needs
    // require it. Left as a no-op placeholder - add your RevenueCat
    // REST API call here if needed, wrapped in try/catch so a failure
    // here never blocks the actual account deletion below.

    // ── 3. Delete the auth user - revokes all sessions immediately. ──
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    return res.status(200).json({ deleted: true });
  } catch (e) {
    console.error("Account deletion failed:", e);
    return res.status(500).json({ error: e.message || "Deletion failed" });
  }
};
