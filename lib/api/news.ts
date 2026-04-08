import Parser from "rss-parser";
import type { NewsArticle } from "@/types";

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentFull'],
    ],
  }
});

const IGN_ES_RSS_URL = "https://es.ign.com/feed.xml";

export async function fetchGamingNews(limit: number = 5): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(IGN_ES_RSS_URL);
    
    return feed.items.slice(0, limit).map((item, index) => {
      // Calculate simple time difference string
      const pubDate = new Date(item.pubDate || Date.now());
      const hoursAgo = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60));
      const timeStr = hoursAgo === 0 ? "hace <1h" : `hace ${hoursAgo}h`;

      return {
        id: item.guid || `news-${index}`,
        title: item.title || "Noticia sin título",
        source: "IGN España",
        url: item.link || "#",
        time: timeStr
      };
    });
  } catch (error) {
    console.error("RSS Parsing Error:", error);
    return [];
  }
}
