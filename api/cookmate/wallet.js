const { verifyUser, unauthorized } = require('../../lib/auth');
const { getWallet } = require('../../lib/wallet');
const { getSupabaseAdmin } = require('../../lib/supabaseAdmin');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const user = await verifyUser(req);
  if (!user) return unauthorized(res);

  try {
    const wallet = await getWallet(user.id);
    const { data: dailyUsage } = await getSupabaseAdmin()
      .from('daily_usage')
      .select('feature_type,count')
      .eq('user_id', user.id)
      .eq('usage_date', new Date().toISOString().slice(0, 10));
    const { data: subscription } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('status,product_id,current_period_end,entitlement_id')
      .eq('user_id', user.id)
      .eq('entitlement_id', 'cookmate_plus')
      .maybeSingle();
    return res.status(200).json({
      wallet,
      daily_usage: dailyUsage || [],
      subscription: subscription || null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Failed to load wallet' });
  }
};
