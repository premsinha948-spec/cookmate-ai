const { getSupabaseAdmin } = require('./supabaseAdmin');

async function tryConsumeFreeUsage(userId, featureType, dailyLimit) {
  const { data, error } = await getSupabaseAdmin().rpc('try_consume_free_usage', {
    p_user_id: userId,
    p_feature_type: featureType,
    p_daily_limit: dailyLimit,
  });
  if (error) throw error;
  return !!data;
}

async function releaseFreeUsage(userId, featureType) {
  const { error } = await getSupabaseAdmin().rpc('release_free_usage', {
    p_user_id: userId,
    p_feature_type: featureType,
  });
  if (error) throw error;
}

async function consumeAdBonusAction(userId) {
  const { data, error } = await getSupabaseAdmin().rpc('consume_ad_bonus_action', {
    p_user_id: userId,
  });
  if (error) throw error;
  return !!data;
}

async function restoreAdBonusAction(userId) {
  const { error } = await getSupabaseAdmin().rpc('restore_ad_bonus_action', {
    p_user_id: userId,
  });
  if (error) throw error;
}

async function reserveCredits(userId, amount) {
  const { data, error } = await getSupabaseAdmin().rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    if (String(error.message).includes('INSUFFICIENT_CREDITS')) {
      const err = new Error('INSUFFICIENT_CREDITS');
      err.code = 'INSUFFICIENT_CREDITS';
      throw err;
    }
    throw error;
  }
  return data;
}

async function settleCredits(userId, params) {
  const { data, error } = await getSupabaseAdmin().rpc('settle_credits', {
    p_user_id: userId,
    p_reserved_amount: params.reservedAmount,
    p_actual_amount: params.actualAmount,
    p_request_id: params.requestId,
    p_feature_type: params.featureType,
    p_provider: params.provider,
    p_model: params.model,
    p_input_tokens: params.inputTokens,
    p_output_tokens: params.outputTokens,
    p_total_tokens: params.totalTokens,
    p_estimated_cost: params.estimatedCostUsd,
    p_was_free: params.wasFree,
    p_was_ad_bonus: params.wasAdBonus || false,
  });
  if (error) throw error;
  return data;
}

async function releaseReservation(userId, amount) {
  const { data, error } = await getSupabaseAdmin().rpc('release_reservation', {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw error;
  return data;
}

async function getWallet(userId) {
  const supabase = getSupabaseAdmin();
  const ensured = await supabase.rpc('ensure_wallet', { p_user_id: userId });
  if (ensured.error) throw ensured.error;
  const { data, error } = await supabase.from('user_wallets').select('*').eq('user_id', userId).single();
  if (error) throw error;
  return data;
}

async function isPlusSubscriber(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('status,current_period_end,entitlement_id')
    .eq('user_id', userId)
    .eq('entitlement_id', 'cookmate_plus')
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  if (!['active', 'grace_period'].includes(data.status)) return false;
  if (!data.current_period_end) return true;
  return new Date(data.current_period_end).getTime() > Date.now();
}

module.exports = {
  tryConsumeFreeUsage,
  releaseFreeUsage,
  consumeAdBonusAction,
  restoreAdBonusAction,
  reserveCredits,
  settleCredits,
  releaseReservation,
  getWallet,
  isPlusSubscriber,
};
