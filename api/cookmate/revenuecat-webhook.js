const { getSupabaseAdmin } = require("../../lib/supabaseAdmin");

// Maps RevenueCat product IDs to how many credits a one-time purchase
// of that product grants. Keep in sync with spec section 19 / your
// Google Play product catalog.
const CREDIT_PRODUCT_AMOUNTS = {
  cookmate_credits_200: 200,
  cookmate_credits_500: 500,
  cookmate_credits_1000: 1000,
  cookmate_credits_1500: 1500,
  cookmate_credits_3000: 3000,
  cookmate_credits_6000: 6000,
};

const SUBSCRIPTION_PRODUCTS = new Set([
  "cookmate_plus_monthly",
  "cookmate_plus_yearly",
]);

// This is the URL you paste into RevenueCat Dashboard -> Project
// Settings -> Integrations -> Webhooks, along with the same secret
// you set as REVENUECAT_WEBHOOK_SECRET below (RevenueCat sends it
// back as "Authorization: Bearer <secret>" on every webhook call -
// a plain shared-secret check, not a signature scheme, so this is
// safe to implement and test without a real crypto library).
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = req.headers["authorization"] || "";
  const expected = `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`;
  if (!process.env.REVENUECAT_WEBHOOK_SECRET || auth !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const event = req.body?.event;
  if (!event) return res.status(400).json({ error: "Missing event" });

  // `app_user_id` is the Supabase user ID, because Flutter calls
  // Purchases.logIn(supabaseUserId) right after sign-in (see
  // RevenueCatService.login) - so RevenueCat's identity always maps
  // back to a real Supabase user, per spec section 17.
  const userId = event.app_user_id;
  const productId = event.product_id;
  const transactionId = event.id || event.transaction_id;

  if (!userId || !transactionId) {
    return res.status(400).json({ error: "Missing user/transaction id" });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE": {
        if (CREDIT_PRODUCT_AMOUNTS[productId]) {
          // One-time credit pack purchase.
          await supabase.rpc("grant_credits", {
            p_user_id: userId,
            p_amount: CREDIT_PRODUCT_AMOUNTS[productId],
            p_type: "purchase",
            p_source: productId,
            p_reference_id: transactionId,
          });
          await supabase.from("purchases").upsert(
            {
              user_id: userId,
              purchase_id: transactionId,
              product_id: productId,
              credits: CREDIT_PRODUCT_AMOUNTS[productId],
              status: "completed",
              provider: "revenuecat",
            },
            { onConflict: "purchase_id" }
          );
        } else if (SUBSCRIPTION_PRODUCTS.has(productId)) {
          await upsertSubscription(supabase, userId, productId, "active", event);
          // Per spec section 16 - premium gets an included AI
          // allowance per billing period, granted as a bonus credit
          // amount here. Adjust the amount to whatever "1000 credits
          // per billing period" should map to for your pricing.
          await supabase.rpc("grant_credits", {
            p_user_id: userId,
            p_amount: 1000,
            p_type: "subscription_bonus",
            p_source: productId,
            p_reference_id: `${transactionId}_bonus`,
          });
        }
        break;
      }

      case "RENEWAL": {
        if (SUBSCRIPTION_PRODUCTS.has(productId)) {
          await upsertSubscription(supabase, userId, productId, "active", event);
          await supabase.rpc("grant_credits", {
            p_user_id: userId,
            p_amount: 1000,
            p_type: "subscription_bonus",
            p_source: productId,
            p_reference_id: `${transactionId}_bonus`,
          });
        }
        break;
      }

      case "CANCELLATION":
        await upsertSubscription(supabase, userId, productId, "cancelled", event);
        break;

      case "EXPIRATION":
        await upsertSubscription(supabase, userId, productId, "expired", event);
        break;

      case "BILLING_ISSUE":
        await upsertSubscription(supabase, userId, productId, "grace_period", event);
        break;

      default:
        // Other event types (PRODUCT_CHANGE, TRANSFER, etc.) aren't
        // handled yet - acknowledge so RevenueCat doesn't retry.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("RevenueCat webhook error:", e);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

async function upsertSubscription(supabase, userId, productId, status, event) {
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      entitlement_id: "cookmate_plus",
      product_id: productId,
      status,
      current_period_end: event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}
