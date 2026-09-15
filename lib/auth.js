const { getSupabaseAdmin } = require("./supabaseAdmin");

/**
 * Verifies the caller's Supabase access token (sent from Flutter as
 * `Authorization: Bearer <access_token>`, i.e. the user's own JWT
 * from `supabase.auth.currentSession`, NOT an API key).
 *
 * Returns the authenticated user object, or null if the token is
 * missing/invalid/expired. Every endpoint that touches the wallet or
 * calls a paid AI provider MUST call this first and reject the
 * request (401) if it returns null - the client must never be
 * trusted to say who it is.
 */
async function verifyUser(req) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

/** Small helper for a consistent 401 response shape. */
function unauthorized(res) {
  res.status(401).json({ error: "Unauthorized - missing or invalid session." });
}

module.exports = { verifyUser, unauthorized };
