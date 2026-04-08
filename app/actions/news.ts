"use server";

import { getGameSpecificNews } from "@/lib/news-aggregator";
import { NewsArticle } from "@/types";

export async function searchDeepNewsAction(query: string): Promise<NewsArticle[]> {
  if (!query || query.length < 3) return [];
  
  // Scans the web specifically for this query
  return await getGameSpecificNews(query, 6);
}
