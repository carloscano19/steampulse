// NewsData.io API Wrapper
// TODO: Implement in Phase 5

export async function fetchNews(query: string) {
  console.log("NewsData fetch:", query);
  return [];
}

export function scoreRelevance(article: { title: string; content?: string; source?: string }): number {
  // Placeholder scoring algorithm
  let score = 0;
  const highPriorityKeywords = ["fortnite", "esports", "gaming", "new release", "update"];

  for (const keyword of highPriorityKeywords) {
    if (article.title.toLowerCase().includes(keyword)) score += 3;
    if (article.content?.toLowerCase().includes(keyword)) score += 1;
  }

  return score;
}
