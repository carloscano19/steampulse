import type { Game } from "@/types";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4/games";

let _accessToken = "";
let _tokenExpiry = 0;

/**
 * Retrieves and caches the Twitch OAuth App Access Token.
 */
async function getTwitchToken(): Promise<string> {
  // Return cached token if valid
  if (_accessToken && Date.now() < _tokenExpiry) {
    return _accessToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("IGDB (Twitch) credentials are not set in environment variables");
  }

  const res = await fetch(
    `${TWITCH_OAUTH_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`Twitch OAuth error: ${res.statusText}`);
  }

  const data = await res.json();
  _accessToken = data.access_token;
  // Expire 5 min before actual expiration (usually ~60 days) to be safe
  _tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return _accessToken;
}

/**
 * Makes an Apicalypse query to IGDB.
 */
async function queryIGDB(body: string) {
  const token = await getTwitchToken();
  const clientId = process.env.IGDB_CLIENT_ID!;

  const res = await fetch(IGDB_API_URL, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Accept": "application/json",
    },
    body,
    // ISR cache for IGDB fetches disabled (0) to allow dynamic randomness from callers
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`IGDB API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Transforms IGDB raw data into our internal Game type.
 */
function transformGame(raw: any): Game {
  // Convert thumb size to big cover art (SRS 4.3)
  const coverUrl = raw.cover?.url 
    ? `https:${raw.cover.url.replace("t_thumb", "t_cover_big")}` 
    : undefined;

  const screenshots = raw.screenshots
    ? raw.screenshots.map((s: any) => `https://images.igdb.com/igdb/image/upload/t_1080p/${s.image_id}.jpg`)
    : undefined;
    
  const companies = raw.involved_companies
    ? raw.involved_companies.map((c: any) => c.company.name)
    : undefined;

  const videoId = raw.videos && raw.videos.length > 0
    ? raw.videos[0].video_id
    : undefined;

  return {
    id: raw.id.toString(), // Our internal UUID is unused here, using IGDB ID as base
    igdb_id: raw.id,
    slug: raw.slug,
    name: raw.name,
    cover_url: coverUrl,
    summary: raw.summary,
    rating: raw.rating ? Math.round(raw.rating) : undefined,
    genres: raw.genres?.map((g: any) => g.name),
    platforms: raw.platforms?.map((p: any) => p.abbreviation || p.name),
    screenshots,
    videoId,
    companies,
    release_date: raw.first_release_date
      ? new Date(raw.first_release_date * 1000).toISOString()
      : undefined,
  };
}

/**
 * Search games via IGDB catalog with optional categories.
 */
export async function searchGames(
  query: string, 
  limit = 20, 
  offset = 0, 
  category: 'trending' | 'top-rated' | 'recent' | 'all' = 'trending'
): Promise<Game[]> {
  // Apicalypse query
  let apicQuery = `fields name, slug, cover.url, genres.name, platforms.name, platforms.abbreviation, rating, summary, first_release_date;`;
  apicQuery += ` limit ${limit}; offset ${offset};`;

  if (query) {
    const cleanQuery = query.replace(/"/g, '\\"');
    apicQuery += ` search "${cleanQuery}";`;
    apicQuery += ` where version_parent = null & cover != null;`; 
  } else {
    const now = Math.floor(Date.now() / 1000);
    
    switch(category) {
      case 'top-rated':
        // Popular and highly rated (with enough votes to be credible)
        apicQuery += ` where cover != null & version_parent = null & rating_count > 20 & rating > 80;`;
        apicQuery += ` sort rating desc;`;
        break;
      case 'recent':
        // Released in the last 6 months or upcoming
        apicQuery += ` where cover != null & version_parent = null & first_release_date < ${now} & first_release_date > ${now - (180 * 24 * 60 * 60)};`;
        apicQuery += ` sort first_release_date desc;`;
        break;
      case 'trending':
      default:
        // Anticated / Hyped games
        apicQuery += ` where cover != null & version_parent = null & (hypes > 0 | follows > 0);`;
        apicQuery += ` sort hypes desc;`;
        break;
    }
  }

  const results = await queryIGDB(apicQuery);
  return results.map(transformGame);
}

export async function getGameBySlug(slug: string) {
  const cleanSlug = slug.replace(/"/g, '\\"');
  const apicQuery = `fields name, slug, cover.url, genres.name, platforms.name, platforms.abbreviation, rating, summary, first_release_date, screenshots.image_id, videos.video_id, involved_companies.company.name; where slug = "${cleanSlug}"; limit 1;`;
  const results = await queryIGDB(apicQuery);
  return results.length ? transformGame(results[0]) : null;
}

export async function getSimilarGames(igdbId: number) {
  return [];
}
