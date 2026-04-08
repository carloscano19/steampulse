import { searchGames } from "@/lib/api/igdb";
import type { NewsArticle } from "@/types";

/**
 * Heuristic algorithm to extract a likely game title from a news headline.
 */
export function extractGameTitleHeuristic(headline: string): string | null {
  // 1. Check for quoted titles (e.g. "GTA 6", 'The Last of Us')
  const quoteMatch = headline.match(/(["'])(.*?)\1/);
  if (quoteMatch && quoteMatch[2].length > 3) {
    return quoteMatch[2];
  }

  // 2. Strip common journalistic prefixes in Spanish
  let cleanHead = headline;
  const prefixes = [
    "análisis de ", "avance de ", "gameplay de ",
    "review de ", "tráiler de ", "nuevos detalles de ",
    "fecha de lanzamiento de ", "rumor: ", "noticia: "
  ];
  
  const lowerHead = cleanHead.toLowerCase();
  for (const prefix of prefixes) {
    if (lowerHead.startsWith(prefix)) {
       cleanHead = cleanHead.slice(prefix.length);
       break;
    }
  }

  // 3. Try splitting by colon or dash and take the left or right part
  if (cleanHead.includes(":")) {
     const parts = cleanHead.split(":");
     if (parts[0].split(" ").length <= 5) return parts[0].trim();
  }
  if (cleanHead.includes("-")) {
     const parts = cleanHead.split("-");
     if (parts[0].split(" ").length <= 5) return parts[0].trim();
  }

  // 4. Fallback: return the first 3-4 words max if they look like proper nouns
  // A bit risky, but IGDB search engine is somewhat fuzzy. We limit to 50 chars.
  const words = cleanHead.split(" ").slice(0, 5).join(" ");
  return words.length > 3 ? words : null;
}

/**
 * Synthesizes an IGDB Mini-Match card for a headline.
 */
export async function attachIGDBMatch(article: NewsArticle): Promise<NewsArticle> {
  const query = extractGameTitleHeuristic(article.title);
  
  if (!query) return article;

  try {
    // Only fetch top 1 hit to save bandwidth and speed
    const hits = await searchGames(query, 1, 0);
    
    if (hits && hits.length > 0) {
      const game = hits[0];
      
      // Basic safeguard: If the IGDB search result doesn't share any word with the headline, it's a false positive.
      const gameTitleWords = game.name.toLowerCase().split(/\s+/);
      const headlineLower = article.title.toLowerCase();
      const hasOverlap = gameTitleWords.some(w => w.length > 3 && headlineLower.includes(w));

      if (hasOverlap && game.rating && game.rating > 0) {
        return {
          ...article,
          igdbMatch: {
            name: game.name,
            slug: game.slug,
            rating: game.rating,
            releaseYear: game.release_date ? new Date(game.release_date).getFullYear().toString() : "TBA",
            platforms: game.platforms?.slice(0, 3) || [] 
          }
        };
      }
    }
  } catch (error) {
    console.error(`IGDB Match Error for "${article.title}":`, error);
  }

  return article;
}
