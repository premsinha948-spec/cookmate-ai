// ============================================================
// AdMob Server-Side Verification (SSV) - signature check
// ============================================================
//
// Implements Google's documented SSV verification algorithm:
// https://developers.google.com/admob/android/rewarded-video-ssv
// (same scheme for iOS/web - the callback query params are identical)
//
// ⚠️ I have NOT been able to test this against a real signed request
// (no AdMob account or network access in my environment). The
// structure and algorithm below follow Google's documentation as
// closely as I can, but you MUST verify it yourself before trusting
// it in production:
//
//   AdMob console → your rewarded ad unit → "Server-side verification"
//   → there's a "Send test SSV callback" button that fires a real,
//   correctly-signed request at whatever URL you give it. Point it at
//   your deployed `/api/admob-ssv` and confirm in your logs that
//   `verifyAdMobSsvRequest` returns true for it BEFORE relying on this
//   for real rewards.
//
// If it returns false on a genuine test callback, the most likely
// culprits are (roughly in order of likelihood):
//   1. The exact substring being verified isn't byte-for-byte what
//      Google signed (see `buildContentToVerify` below - the order
//      and inclusion of query params matters; this uses the RAW
//      request URL, not a parsed/re-serialized query object, for
//      exactly this reason).
//   2. Key format - Google's JSON gives a PEM directly, which Node's
//      crypto.verify should accept as-is, but double check the
//      fetched JSON's shape hasn't changed since this was written.
//   3. Signature encoding - this assumes a standard DER ECDSA
//      signature, base64url-encoded, verified with SHA256. If it
//      keeps failing, log the raw `signature` param's decoded byte
//      length and compare against what a DER ECDSA-P256 signature
//      should look like (~70-72 bytes).
// ============================================================

const crypto = require("crypto");

const KEYS_URL = "https://gstatic.com/admob/reward/verifier-keys.json";
const KEY_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let _keyCache = null;
let _keyCacheAt = 0;

async function fetchVerifierKeys() {
  const now = Date.now();
  if (_keyCache && now - _keyCacheAt < KEY_CACHE_TTL_MS) {
    return _keyCache;
  }
  const fetch = require("node-fetch");
  const res = await fetch(KEYS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch AdMob verifier keys: ${res.status}`);
  }
  const json = await res.json();
  _keyCache = json.keys || [];
  _keyCacheAt = now;
  return _keyCache;
}

function base64UrlToBuffer(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

/**
 * Per Google's docs: the signed content is the query string up to and
 * INCLUDING the `transaction_id` parameter, in the exact order the
 * params arrived in the URL - not re-sorted, not re-encoded. The raw
 * request URL (as received, before any framework parses it into an
 * object) is the only reliable source for this.
 */
function buildContentToVerify(rawUrl) {
  const queryStart = rawUrl.indexOf("?");
  if (queryStart === -1) return null;
  const rawQuery = rawUrl.slice(queryStart + 1);

  const tidMatch = rawQuery.match(/(^|&)transaction_id=[^&]*/);
  if (!tidMatch) return null;
  const endOfTid = tidMatch.index + tidMatch[0].length;
  return rawQuery.slice(0, endOfTid);
}

/**
 * @param {Record<string,string>} queryParams parsed query params (for
 *   convenience reading `signature`/`key_id`)
 * @param {string} rawUrl the raw `req.url` (path + query, unparsed)
 *   from the incoming request - required for exact signature matching
 */
async function verifyAdMobSsvRequest(queryParams, rawUrl) {
  try {
    const { signature, key_id: keyId } = queryParams;
    if (!signature || !keyId || !rawUrl) return false;

    const content = buildContentToVerify(rawUrl);
    if (!content) return false;

    const keys = await fetchVerifierKeys();
    const key = keys.find((k) => String(k.keyId) === String(keyId));
    if (!key || !key.pem) {
      console.warn(`AdMob SSV: no matching key for key_id=${keyId}`);
      return false;
    }

    const signatureBuffer = base64UrlToBuffer(signature);

    const verifier = crypto.createVerify("SHA256");
    verifier.update(content);
    verifier.end();

    return verifier.verify(key.pem, signatureBuffer);
  } catch (e) {
    console.error("AdMob SSV verification error:", e);
    return false; // any failure = reject, never accept on uncertainty
  }
}

module.exports = { verifyAdMobSsvRequest, buildContentToVerify };
