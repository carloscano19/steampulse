// Supabase Cache Helpers
// TODO: Implement with actual Supabase client

export async function readCache<T>(table: string, key: string): Promise<T | null> {
  console.log("Cache read:", { table, key });
  return null;
}

export async function writeCache(table: string, key: string, data: unknown, ttlMinutes: number): Promise<void> {
  console.log("Cache write:", { table, key, ttlMinutes });
}

export async function invalidateCache(table: string, key?: string): Promise<void> {
  console.log("Cache invalidate:", { table, key });
}
