import type { TwitchStream } from "@/types";
import { getTwitchToken, fetchWithTimeout } from "./twitch-token";

const TWITCH_API_URL = "https://api.twitch.tv/helix";

export async function getTopTwitchStreams(limit: number = 16): Promise<TwitchStream[]> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.IGDB_CLIENT_ID!;

    const res = await fetchWithTimeout(`${TWITCH_API_URL}/streams?first=${limit}&language=es`, {
      headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` },
      next: { revalidate: 300 }
    });

    if (!res.ok) return [];

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
  } catch (err) {
    console.error("getTopTwitchStreams failed:", err);
    return [];
  }
}

export async function getGameStreams(gameName: string, limit: number = 4): Promise<TwitchStream[]> {
  try {
    const token = await getTwitchToken();
    const clientId = process.env.IGDB_CLIENT_ID!;

    // 1. Convert Game Name to Twitch Game ID via Search Categories
    const safeName = encodeURIComponent(gameName);
    const searchRes = await fetchWithTimeout(`${TWITCH_API_URL}/search/categories?query=${safeName}&first=1`, {
      headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
    });

    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    if (!searchData.data || searchData.data.length === 0) return [];

    const gameId = searchData.data[0].id;

    // 2. Fetch Active Streams for this game (language Spanish prioritizing)
    const streamsRes = await fetchWithTimeout(`${TWITCH_API_URL}/streams?game_id=${gameId}&first=${limit}&language=es`, {
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
  } catch (err) {
    console.error("getGameStreams failed:", err);
    return [];
  }
}
