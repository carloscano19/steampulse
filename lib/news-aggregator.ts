import Parser from "rss-parser";
import type { NewsArticle } from "@/types";

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentFull'],
    ],
  }
});

interface FeedConfig {
  name: string;
  url: string;
  accent: "purple" | "blue" | "green" | "default";
}

const FEEDS: FeedConfig[] = [
  { name: "IGN España", url: "https://es.ign.com/feed.xml", accent: "purple" },
  { name: "Vandal", url: "https://vandal.elespanol.com/xml.cgi", accent: "blue" },
  { name: "Eurogamer", url: "https://www.eurogamer.es/feed/news", accent: "green" },
  { name: "HobbyConsolas", url: "https://www.hobbyconsolas.com/rss", accent: "default" },
  // Supplemental Console & General Feeds to guarantee populated tabs:
  { name: "PS 5", url: "https://news.google.com/rss/search?q=PlayStation+5+videojuegos&hl=es&gl=ES&ceid=ES:es", accent: "blue" },
  { name: "PC", url: "https://news.google.com/rss/search?q=PC+Steam+juegos&hl=es&gl=ES&ceid=ES:es", accent: "default" },
  { name: "Xbox", url: "https://news.google.com/rss/search?q=Xbox+Series+videojuegos&hl=es&gl=ES&ceid=ES:es", accent: "green" }
];

// Lightweight stop words for Spanish to improve heuristic clustering
const STOP_WORDS = new Set(["el", "la", "los", "las", "un", "una", "y", "en", "de", "del", "a", "al", "que", "por", "con", "para", "se", "sobre", "su", "sus", "como"]);

function extractKeywords(title: string): Set<string> {
  const words = title.toLowerCase().replace(/[^\w\sñáéíóú]/g, '').split(/\s+/);
  return new Set(words.filter(w => w.length > 3 && !STOP_WORDS.has(w)));
}

function calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  const minSize = Math.min(setA.size, setB.size);
  if (minSize === 0) return 0;
  return intersection / minSize;
}

/**
 * Orchestrates parallel fetching from multiple RSS feeds and deduplicates them.
 */
import { attachIGDBMatch } from "./intelligence/igdb-matcher";

export async function getAggregatedNews(limit: number = 8, skipIGDBMatch: boolean = false): Promise<NewsArticle[]> {
  const promises = FEEDS.map(config => fetchFeed(config));
  const results = await Promise.allSettled(promises);
  
  let allArticles: NewsArticle[] = [];
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles = allArticles.concat(result.value);
    }
  }

  // Sort strictly by chronology (newest first)
  allArticles.sort((a, b) => new Date(b.time + " UTC").getTime() - new Date(a.time + " UTC").getTime());

  // Deduplication Engine
  const deduplicated: NewsArticle[] = [];
  
  for (const article of allArticles) {
    const articleKeywords = extractKeywords(article.title);
    
    let isDuplicate = false;
    for (let i = 0; i < deduplicated.length; i++) {
       const existing = deduplicated[i];
       const existingKeywords = extractKeywords(existing.title);
       
       const similarity = calculateSimilarity(articleKeywords, existingKeywords);
       
       if (similarity > 0.6) {
         isDuplicate = true;
         if (!existing.imageUrl && article.imageUrl) {
            deduplicated[i] = article; 
         }
         break;
       }
    }
    
    if (!isDuplicate) {
      deduplicated.push(article);
    }
  }

  // Slice limits and Format times 
  const finalArticles = deduplicated.slice(0, limit).map(article => {
     const pubDate = new Date(article.time); 
     const hoursAgo = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60));
     const timeStr = hoursAgo === 0 ? "hace <1h" : `hace ${hoursAgo}h`;
     return { ...article, time: timeStr };
  });

  if (skipIGDBMatch) {
     return finalArticles;
  }

  // Apply IGDB Content Intelligence (Sequential to prevent IGDB 4req/sec rate limits)
  const matchedArticles: NewsArticle[] = [];
  for (const article of finalArticles) {
     const matched = await attachIGDBMatch(article);
     matchedArticles.push(matched);
     // Sleep 250ms to ensure we stay under 4 requests per second limit
     await new Promise(resolve => setTimeout(resolve, 250));
  }

  return matchedArticles;
}

async function fetchFeed(config: FeedConfig): Promise<NewsArticle[]> {
  try {
    let feed;
    
    // Some legacy feeds like Vandal have invisible BOM or whitespace before XML
    if (config.url.includes("vandal")) {
      const res = await fetch(config.url, { next: { revalidate: 600 } });
      const text = await res.text();
      const cleanText = text.substring(text.indexOf("<?xml"));
      feed = await parser.parseString(cleanText);
    } else {
      // For compliant modern feeds with Next.js caching
      const res = await fetch(config.url, { next: { revalidate: 600 } });
      const rawXml = await res.text();
      feed = await parser.parseString(rawXml);
    }

    const articles: NewsArticle[] = [];
    
    for (let i = 0; i < Math.min(10, feed.items.length); i++) {
       const item = feed.items[i];
       if (!item.title) continue;

       let img = "";
       // Extract image gracefully across heterogeneous feeds
       if (item.media && item.media["$"]?.url) img = item.media["$"].url;
       else if (item.enclosure?.url) img = item.enclosure.url;
       else if (item.thumbnail && item.thumbnail["$"]?.url) img = item.thumbnail["$"].url;
       else if (item.contentFull || item.content) {
         const match = (item.contentFull || item.content).match(/<img[^>]+src="([^">]+)"/);
         if (match) img = match[1];
       }

       articles.push({
         id: item.guid || `${config.name}-${i}`,
         title: item.title,
         source: config.name,
         url: item.link || "#",
         time: item.pubDate || new Date().toISOString(), // keep pure ISO string for sorting
         imageUrl: img,
         badgeAccent: config.accent
       });
    }
    return articles;
  } catch (err) {
    console.error(`Feed Error [${config.name}]:`, err);
    return [];
  }
}

/**
 * Searches specific game news via dynamic Google News RSS.
 * Ensures the Game Detail pages never show empty news grids.
 */
export async function getGameSpecificNews(gameName: string, limit: number = 3): Promise<NewsArticle[]> {
  try {
     // Remove restrictive keywords to allow fresh natural news
     const safeName = encodeURIComponent(`"${gameName}"`);
     const url = `https://news.google.com/rss/search?q=${safeName}&hl=es&gl=ES&ceid=ES:es`;
     const res = await fetch(url, { next: { revalidate: 3600 } });
     const rawXml = await res.text();
     const feed = await parser.parseString(rawXml);
     
     // Google returns by Relevance. We MUST sort by Date to get the absolute newest articles.
     const sortedItems = feed.items.sort((a, b) => {
        const d1 = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const d2 = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return d2 - d1;
     });

     const articles: NewsArticle[] = [];
     for(let i = 0; i < Math.min(limit, sortedItems.length); i++) {
        const item = sortedItems[i];
        const cleanTitle = item.title?.replace(/\s-\s[^-]+$/, "") || "";
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const hoursAgo = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60));
        
        let timeStr = "";
        if (hoursAgo === 0) timeStr = "hace <1h";
        else if (hoursAgo < 24) timeStr = `hace ${hoursAgo}h`;
        else timeStr = `hace ${Math.floor(hoursAgo/24)}d`;
        
        // Extract dynamically (Google News puts images in description, content, or media extensions)
        let img = "";
        const htmlContent = item.contentFull || item.content || item.description || "";
        const match = htmlContent.match(/<img[^>]+src="([^">]+)"/i);
        if (match && match[1]) img = match[1];
        else if (item.media && item.media["$"]?.url) img = item.media["$"].url;

        articles.push({
           id: item.guid || `gn-${gameName}-${i}`,
           title: cleanTitle,
           source: item.creator || "Media Español",
           url: item.link || "#",
           time: timeStr,
           imageUrl: img,
           badgeAccent: "blue"
        });
     }
     return articles;
  } catch(e) {
     console.error("Game Specific News fetch error:", e);
     return [];
  }
}

const ELITE_CHANNELS = [
  { id: "UCo4k7uMo-JgnNaP3TbKT2Zw", name: "RaySnakeyes" },
  { id: "UCxrWeP42ElIrGe7LChm1PGA", name: "REVENANT" },
  { id: "UCfS7v7L6QYV4f_4I-tYyG2Q", name: "EurogamerES" },
  { id: "UC_uN-k7tJmE6X-9p_9u-u2g", name: "Vandal TV" },
  { id: "UC9_O-pSscS_6VAn-nK7Uo7A", name: "BaityBait" },
  { id: "UCY6G_Z-zO-20B-lZ_78d-1g", name: "DayoScript" }
];

/**
 * Searches YouTube videos via Google News RSS with site:youtube.com filter.
 */
export async function getGameYouTubeVideos(gameName: string, limit: number = 3): Promise<NewsArticle[]> {
  try {
     const query = encodeURIComponent(`site:youtube.com "${gameName}" (review OR guía OR gameplay OR walkthrough) español`);
     const url = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;
     
     const res = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' 
        },
        next: { revalidate: 3600 } 
     });

     if (!res.ok) return [];

     const rawXml = await res.text();
     if (!rawXml.trim().startsWith("<?xml")) return [];

     const feed = await parser.parseString(rawXml);
     
     const videos: NewsArticle[] = [];
     for(let i = 0; i < Math.min(limit, feed.items.length); i++) {
        const item = feed.items[i];
        const cleanTitle = item.title?.replace(/\s-\s[^-]+$/, "") || "";
        
        let img = "";
        const htmlContent = item.contentFull || item.content || item.description || "";
        const match = htmlContent.match(/<img[^>]+src="([^">]+)"/i);
        if (match && match[1]) img = match[1];
        
        videos.push({
           id: item.guid || `yt-${gameName}-${i}`,
           title: cleanTitle,
           source: item.creator || "YouTube",
           url: item.link || "#",
           time: "hace poco",
           imageUrl: img,
           badgeAccent: "default"
        });
     }
     return videos;
  } catch(e) {
     console.error("Game YouTube fetch error:", e);
     return [];
  }
}

/**
 * Fetches latest videos from elite gaming channels via their direct YouTube RSS feeds.
 */
export async function getEliteChannelVideos(limit: number = 2): Promise<(NewsArticle & { videoId?: string })[]> {
  const allVideos: any[] = [];
     
  for (const channel of ELITE_CHANNELS) {
    try {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      // Usamos un User-Agent de navegador para evitar que YouTube devuelva un HTML de consentimiento
      const res = await fetch(url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' 
        },
        next: { revalidate: 1800 } 
      });
      
      if (!res.ok) {
        console.warn(`Feed error for ${channel.name}: ${res.status}`);
        continue;
      }

      const rawXml = await res.text();
      
      // Verificación de integridad: si es HTML, probablemente es un bloqueo o consentimiento
      if (rawXml.includes("<!DOCTYPE html>") || !rawXml.trim().startsWith("<?xml")) {
        console.warn(`YouTube feed for ${channel.name} returned HTML/invalid XML. Skipping.`);
        continue;
      }

      const feed = await parser.parseString(rawXml);
      
      feed.items.slice(0, limit).forEach((item: any) => {
        const vidId = item.id.replace("yt:video:", "");
        allVideos.push({
          id: item.id,
          videoId: vidId,
          title: item.title,
          source: channel.name,
          url: item.link,
          time: "Reciente",
          imageUrl: `https://i.ytimg.com/vi/${vidId}/maxresdefault.jpg`,
          badgeAccent: "purple"
        });
      });
    } catch(e) {
      console.error(`Individual Elite feed error for ${channel.name}:`, e);
      continue;
    }
  }
     
  return allVideos.sort(() => Math.random() - 0.5); // Mezlca para variedad
}

/**
 * Searches specific game guides and walkthroughs via Google News RSS.
 */
export async function getGameGuides(gameName: string, limit: number = 3): Promise<NewsArticle[]> {
  try {
     const safeName = encodeURIComponent(`"${gameName}" (guía OR paso a paso OR trucos OR secretos OR walkthrough)`);
     const url = `https://news.google.com/rss/search?q=${safeName}&hl=es&gl=ES&ceid=ES:es`;
     const res = await fetch(url, { next: { revalidate: 3600 } });
     const rawXml = await res.text();
     const feed = await parser.parseString(rawXml);
     
     const articles: NewsArticle[] = [];
     for(let i = 0; i < Math.min(limit, feed.items.length); i++) {
        const item = feed.items[i];
        const cleanTitle = item.title?.replace(/\s-\s[^-]+$/, "") || "";
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        const hoursAgo = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60));
        const timeStr = hoursAgo === 0 ? "hace <1h" : (hoursAgo < 24 ? `hace ${hoursAgo}h` : `hace ${Math.floor(hoursAgo/24)}d`);

        // Extract dynamically (Google News puts images in description/content)
        let img = "";
        const htmlContent = item.contentFull || item.content || item.description || "";
        const match = htmlContent.match(/<img[^>]+src="([^">]+)"/i);
        if (match && match[1]) img = match[1];
        else if (item.media && item.media["$"]?.url) img = item.media["$"].url;

        articles.push({
           id: item.guid || `guide-${gameName}-${i}`,
           title: cleanTitle,
           source: item.creator || "Wiki / Guía",
           url: item.link || "#",
           time: timeStr,
           imageUrl: img,
           badgeAccent: "default" 
        });
     }
     return articles;
  } catch(e) {
     console.error("Game Guides fetch error:", e);
     return [];
  }
}

const FC_ELITE_CHANNELS = [
  { id: "UCi7TVXyvrIwqeS9tfYD8UDA", name: "DjMaRiiO" },
  { id: "UC02b2d0WWJsMVFRTWFlVFhR", name: "Cacho01" },
  { id: "UCXR5Vn2vV2L86H8XU_9gCBA", name: "Papi Gavi" },
  { id: "UC8mKgWi2wYt2oRTaXxWHTNA", name: "JeyRuiz" },
  { id: "UCIbIJp0MBdIELeq5T7Dvp8A", name: "Lamberman" }
];

/**
 * Fetches latest content from EA FC elite channels.
 */
export async function getFCYouTubeContent(limit: number = 4): Promise<(NewsArticle & { videoId?: string })[]> {
  const allVideos: any[] = [];
  
  for (const channel of FC_ELITE_CHANNELS) {
    try {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' },
        next: { revalidate: 900 } // 15 minutos (Contenido fresco)
      });
      if (!res.ok) continue;
      
      const rawXml = await res.text();
      if (!rawXml.trim().startsWith("<?xml")) continue;
      
      const feed = await parser.parseString(rawXml);
      feed.items.slice(0, limit).forEach((item: any) => {
        const vidId = item.id.replace("yt:video:", "");
        allVideos.push({
          id: item.id,
          videoId: vidId,
          title: item.title,
          source: channel.name,
          url: item.link,
          time: "Reciente",
          imageUrl: `https://i.ytimg.com/vi/${vidId}/maxresdefault.jpg`,
          badgeAccent: "green"
        });
      });
    } catch(e) { console.error(`FC feed error for ${channel.name}:`, e); }
  }
  return allVideos.sort(() => Math.random() - 0.5);
}

/**
 * Searches EA Sports FC specific news and leaks.
 */
export async function getFCGameNews(limit: number = 5): Promise<NewsArticle[]> {
  try {
     const query = encodeURIComponent(`"EA Sports FC" OR "EA FC 25" OR "EA FC 26" OR "TOTW" OR "FutSheriff" español`);
     const url = `https://news.google.com/rss/search?q=${query}&hl=es&gl=ES&ceid=ES:es`;
     const res = await fetch(url, { next: { revalidate: 900 } }); // 15 minutos (Leaks rápidos)
     const rawXml = await res.text();
     const feed = await parser.parseString(rawXml);
     
     return feed.items.slice(0, limit).map((item, i) => ({
        id: item.guid || `fc-news-${i}`,
        title: item.title?.replace(/\s-\s[^-]+$/, "") || "",
        source: item.creator || "FC Portal",
        url: item.link || "#",
        time: "hace poco",
        badgeAccent: "green"
     }));
  } catch(e) {
     console.error("FC News fetch error:", e);
     return [];
  }
}

