const { createClient } = require("@supabase/supabase-js");

// Service-role key: full DB access, bypasses RLS. This must ONLY ever
// live in Vercel's environment variables (Project Settings -> 
// Environment Variables), never in the Flutter app, never committed
// to git, never logged.
let _client = null;

function getSupabaseAdmin() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

module.exports = { getSupabaseAdmin };
