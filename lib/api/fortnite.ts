import type {
  FortniteShopItem,
  FortniteMapResponse,
  FortnitePlayerStats,
} from "@/types";

const FORTNITE_API_BASE = "https://fortnite-api.com";

function getHeaders(): HeadersInit {
  const key = process.env.FORTNITE_API_KEY;
  if (!key) throw new Error("FORTNITE_API_KEY is not set");
  return {
    Authorization: key,
    "Content-Type": "application/json",
  };
}

/**
 * Fetch today's item shop from Fortnite-API.com
 */
export async function getShop(): Promise<FortniteShopItem[]> {
  const res = await fetch(
    `${FORTNITE_API_BASE}/v2/shop?language=es`,
    {
      headers: getHeaders(),
      cache: "no-store", // Force no cache to fix Next.js cache pollution
    }
  );

  if (!res.ok) {
    console.error(`FortniteAPI shop error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();

  if (!data.data || !data.data.entries) {
    return [];
  }

  // Transform API response to our clean UI type
  const items: FortniteShopItem[] = [];

  data.data.entries.forEach((entry: any) => {
    if (entry.bundle) {
      // If it's a bundle, push the bundle as a single shop item
      items.push({
        id: entry.offerId || entry.bundle.name || Math.random().toString(),
        name: entry.bundle.name,
        type: "Lote", // "Bundle" in Spanish
        rarity: entry.brItems?.[0]?.rarity?.displayValue || "Epic",
        price: entry.finalPrice || 0,
        image: entry.bundle.image || entry.newDisplayAsset?.renderImages?.[0]?.image || "",
        description: entry.bundle.info,
        rawData: { sortPriority: entry.sortPriority || 0 }
      });
    } else if (entry.brItems) {
      // Individual items
      entry.brItems.forEach((brItem: any) => {
        items.push({
          id: brItem.id,
          name: brItem.name,
          type: brItem.type?.displayValue || "Unknown",
          rarity: brItem.rarity?.displayValue || "Common",
          price: entry.finalPrice || 0,
          image: brItem.images?.icon || brItem.images?.featured || entry.newDisplayAsset?.renderImages?.[0]?.image || "",
          description: brItem.description,
          series: brItem.series?.value,
          rawData: { sortPriority: entry.sortPriority || 0 }
        });
      });
    } else if (entry.tracks) {
      entry.tracks.forEach((track: any) => {
        items.push({
          id: track.id,
          name: track.title,
          type: "Jam Track",
          rarity: "Rare",
          price: entry.finalPrice || 0,
          image: track.albumArt || "",
          description: `Artista: ${track.artist}`,
          rawData: { sortPriority: entry.sortPriority || 0 }
        });
      });
    }
  });

  // Sort items mimicking the real game priority (descending)
  items.sort((a, b) => (b.rawData?.sortPriority as number || 0) - (a.rawData?.sortPriority as number || 0));

  return items;
}

/**
 * Fetch current map data from Fortnite-API.com
 */
export async function getMap(): Promise<FortniteMapResponse> {
  const res = await fetch(`${FORTNITE_API_BASE}/v1/map?language=es`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`FortniteAPI map error: ${res.status} ${res.statusText}`);
    return { result: false, images: { pois: "", blank: "" }, pois: [] };
  }

  const raw = await res.json();

  // Adapt fortnite-api.com response structure to our interface
  return {
    result: true,
    images: {
      pois: raw.data.images?.pois || "",
      blank: raw.data.images?.blank || "",
    },
    pois: raw.data.pois?.map((p: any) => ({
      id: p.id,
      name: p.name,
      x: p.location?.x || 0,
      y: p.location?.y || 0
    })) || []
  };
}

/**
 * Fetch player statistics from Fortnite-API.com
 */
export async function getPlayerStats(
  username: string
): Promise<FortnitePlayerStats> {
  const encoded = encodeURIComponent(username);
  const res = await fetch(
    `${FORTNITE_API_BASE}/v2/stats/br/v2?name=${encoded}`,
    {
      headers: getHeaders(),
      cache: "no-store", 
    }
  );

  if (!res.ok) {
    if (res.status === 403) throw new Error("Private Account Mismatch");
    throw new Error(`Stats error: ${res.status}`);
  }

  const raw = await res.json();
  const acc = raw.data;
  const statsAll = acc.stats?.all;
  const statsKeyboard = acc.stats?.keyboardMouse;
  const statsGamepad = acc.stats?.gamepad;
  // Use 'all' input type for broadest coverage
  const statSource = statsAll || statsKeyboard || statsGamepad || {};

  return {
    result: true,
    name: acc.account.name,
    account: {
      id: acc.account.id,
      name: acc.account.name,
    },
    global_stats: {
      solo: mapStatBlock(statSource.solo),
      duo: mapStatBlock(statSource.duo),
      squad: mapStatBlock(statSource.squad),
    },
  };
}

function mapStatBlock(rawBlock: any) {
  if (!rawBlock) return {
    placetop1: 0, kd: 0, winrate: 0, placetop3: 0, placetop5: 0,
    placetop6: 0, placetop10: 0, placetop12: 0, placetop25: 0,
    kills: 0, matchesplayed: 0, minutesplayed: 0, score: 0,
    playersoutlived: 0, lastmodified: 0,
  };
  return {
    placetop1: rawBlock.wins || 0,
    kd: rawBlock.kd || 0,
    winrate: rawBlock.winRate || 0,
    placetop3: rawBlock.top3 || 0,
    placetop5: rawBlock.top5 || 0,
    placetop6: rawBlock.top6 || 0,
    placetop10: rawBlock.top10 || 0,
    placetop12: rawBlock.top12 || 0,
    placetop25: rawBlock.top25 || 0,
    kills: rawBlock.kills || 0,
    matchesplayed: rawBlock.matches || 0,
    minutesplayed: rawBlock.minutesPlayed || 0,
    score: rawBlock.score || 0,
    playersoutlived: rawBlock.playersOutlived || 0,
    lastmodified: Date.now(),
  };
}
