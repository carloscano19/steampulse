// ===== Fortnite Types =====

export interface FortniteShopItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  price: number;
  image: string;
  description?: string;
  series?: string;
  introduction?: {
    season: string;
  };
  rawData?: Record<string, unknown>;
}

export interface FortniteShopResponse {
  result: boolean;
  fullShop: boolean;
  shop: FortniteShopEntry[];
}

export interface FortniteShopEntry {
  mainId: string;
  displayName: string;
  displayDescription?: string;
  displayType: string;
  mainType: string;
  rarity: {
    id: string;
    name: string;
  };
  price: {
    regularPrice: number;
    finalPrice: number;
  };
  displayAssets?: {
    url: string;
    background: string;
    full_background: string;
  }[];
  granted?: {
    id: string;
    type: {
      id: string;
      name: string;
    };
    name: string;
    description: string;
    rarity: {
      id: string;
      name: string;
    };
    images: {
      icon?: string;
      featured?: string;
      background?: string;
      full_background?: string;
    };
    series?: {
      id: string;
      name: string;
    };
  }[];
  section?: {
    id: string;
    name: string;
  };
  banner?: {
    id: string;
    name: string;
  };
}

export interface FortniteMapResponse {
  result: boolean;
  images: {
    pois: string;
    blank: string;
  };
  ppiImages?: {
    url: string;
  };
  pois?: FortniteMapPOI[];
}

export interface FortniteMapPOI {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface FortnitePlayerStats {
  result: boolean;
  name: string;
  account: {
    id: string;
    name: string;
  };
  global_stats: {
    solo: FortniteStatBlock;
    duo: FortniteStatBlock;
    squad: FortniteStatBlock;
  };
}

export interface FortniteStatBlock {
  placetop1: number;
  kd: number;
  winrate: number;
  placetop3: number;
  placetop5: number;
  placetop6: number;
  placetop10: number;
  placetop12: number;
  placetop25: number;
  kills: number;
  matchesplayed: number;
  minutesplayed: number;
  score: number;
  playersoutlived: number;
  lastmodified: number;
}

// ===== Game Types =====

export interface Game {
  id: string;
  igdb_id: number;
  slug: string;
  name: string;
  cover_url?: string;
  summary?: string;
  rating?: number;
  genres?: string[];
  platforms?: string[];
  release_date?: string;
  developer?: string;
  publisher?: string;
  screenshots?: string[];
  videoId?: string;
  companies?: string[];
}

// ===== Creator Types =====

export interface Creator {
  id: string;
  twitch_id: string;
  display_name: string;
  login: string;
  profile_image_url: string;
  broadcaster_type: string;
  description: string;
  view_count: number;
}

export interface TwitchStream {
  id: string;
  user_name: string;
  user_login: string;
  game_name: string;
  viewer_count: number;
  title: string;
  thumbnail_url: string;
}

// ===== News Types =====

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  imageUrl?: string;
  badgeAccent?: "purple" | "blue" | "green" | "default";
  igdbMatch?: {
    name?: string;
    slug?: string;
    rating?: number;
    releaseYear?: string;
    platforms?: string[];
  };
}

// ===== Common Types =====

export interface ApiError {
  message: string;
  status: number;
}
