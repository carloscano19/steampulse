/**
 * Shared Twitch/IGDB OAuth token manager.
 * Single source of truth — used by both igdb.ts and twitch.ts.
 * Includes retry logic and timeout for resilience on Vercel serverless.
 */

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";

let _accessToken = "";
let _tokenExpiry = 0;
let _tokenPromise: Promise<string> | null = null;

/**
 * Fetches with a timeout to prevent hanging on slow APIs.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { next?: { revalidate: number } } = {},
  timeoutMs: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Retrieves and caches the Twitch OAuth App Access Token.
 * Deduplicates concurrent requests and retries once on failure.
 */
export async function getTwitchToken(): Promise<string> {
  // Return cached token if still valid
  if (_accessToken && Date.now() < _tokenExpiry) {
    return _accessToken;
  }

  // Deduplicate concurrent token requests (e.g., parallel API calls)
  if (_tokenPromise) {
    return _tokenPromise;
  }

  _tokenPromise = (async () => {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("IGDB_CLIENT_ID / IGDB_CLIENT_SECRET not set");
    }

    const tokenUrl = `${TWITCH_OAUTH_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    // Try up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetchWithTimeout(tokenUrl, { method: "POST" }, 5000);

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error(`Twitch OAuth attempt ${attempt + 1} failed: ${res.status} — ${body}`);
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 500)); // brief backoff
            continue;
          }
          throw new Error(`Twitch OAuth error: ${res.status}`);
        }

        const data = await res.json();
        _accessToken = data.access_token;
        _tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
        return _accessToken;
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error(`Twitch OAuth attempt ${attempt + 1} timed out`);
        }
        if (attempt === 1) throw err;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    throw new Error("Twitch OAuth failed after retries");
  })();

  try {
    return await _tokenPromise;
  } finally {
    _tokenPromise = null;
  }
}
