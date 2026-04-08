import type { TwitchStream } from "@/types";

const TWITCH_OAUTH_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_API_URL = "https://api.twitch.tv/helix";

let _accessToken = "";
let _tokenExpiry = 0;

/**
 * Retrieves the Twitch OAuth App Access Token 
 */
async function getTwitchToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch/IGDB credentials in env");
  }

  const res = await fetch(
    `${TWITCH_OAUTH_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST", next: { revalidate: 3600 * 24 } }
  );

  if (!res.ok) throw new Error("Twitch OAuth Error");
  
  const data = await res.json();
  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return _accessToken;
}

export async function getTopTwitchStreams(limit: number = 16): Promise<TwitchStream[]> {
  const token = await getTwitchToken();
  const clientId = process.env.IGDB_CLIENT_ID!;

  const res = await fetch(`${TWITCH_API_URL}/streams?first=${limit}&language=es`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` },
    next: { revalidate: 300 }
  });

  if (!res.ok) throw new Error("Failed to fetch Twitch streams");

  const data = await res.json();
  return data.data.map((stream: any) => ({
    id: stream.id,
    user_name: stream.user_name,
    user_login: stream.user_login,
    game_name: stream.game_name,
    viewer_count: stream.viewer_count,
    title: stream.title,
    thumbnail_url: stream.thumbnail_url.replace("{width}", "440").replace("{height}", "248"),
  }));
}

export async function getGameStreams(gameName: string, limit: number = 4): Promise<TwitchStream[]> {
  const token = await getTwitchToken();
  const clientId = process.env.IGDB_CLIENT_ID!;

  // 1. Convert Game Name to Twitch Game ID via Search Categories
  const safeName = encodeURIComponent(gameName);
  const searchRes = await fetch(`${TWITCH_API_URL}/search/categories?query=${safeName}&first=1`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
  });

  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();
  if (!searchData.data || searchData.data.length === 0) return [];

  const gameId = searchData.data[0].id;

  // 2. Fetch Active Streams for this game (language Spanish prioritizing)
  const streamsRes = await fetch(`${TWITCH_API_URL}/streams?game_id=${gameId}&first=${limit}&language=es`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` },
    next: { revalidate: 300 }
  });

  if (!streamsRes.ok) return [];
  const streamsData = await streamsRes.json();

  return streamsData.data.map((stream: any) => ({
    id: stream.id,
    user_name: stream.user_name,
    user_login: stream.user_login,
    game_name: stream.game_name,
    viewer_count: stream.viewer_count,
    title: stream.title,
    thumbnail_url: stream.thumbnail_url.replace("{width}", "440").replace("{height}", "248"),
  }));
}
