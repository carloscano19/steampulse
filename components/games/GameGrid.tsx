"use client";

import { useState, useEffect } from "react";
import type { Game } from "@/types";
import { GameCard } from "./GameCard";
import { Skeleton } from "@/components/common/Skeleton";

export function GameGrid({ initialGames }: { initialGames: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<'trending' | 'top-rated' | 'recent' | 'all'>('trending');
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(initialGames.length >= 20);

  // Debounced search logic & Category switching
  useEffect(() => {
    // If we're performing a search, we ignore categories temporarily for global search
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setOffset(0);
      try {
        const queryParam = search.trim() ? `q=${encodeURIComponent(search.trim())}` : `category=${category}`;
        const res = await fetch(`/api/games?${queryParam}`);
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        setGames(data.games || []);
        setHasMore(data.games?.length >= 20);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, search.trim() ? 600 : 0); // No debounce for category switches

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextOffset = offset + 20;
      const queryParam = search.trim() ? `q=${encodeURIComponent(search.trim())}&` : `category=${category}&`;
      
      const res = await fetch(`/api/games?${queryParam}offset=${nextOffset}`);
      if (!res.ok) throw new Error("Load more failed");
      
      const data = await res.json();
      const newGames = data.games || [];
      
      setGames((prev) => [...prev, ...newGames]);
      setOffset(nextOffset);
      setHasMore(newGames.length >= 20);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = [
    { id: 'trending', label: '🔥 Tendencias', color: 'accent-purple' },
    { id: 'top-rated', label: '⭐ Mejor Valorados', color: 'yellow-500' },
    { id: 'recent', label: '📅 Novedades', color: 'accent-blue' },
  ];

  return (
    <div>
      {/* Category Tabs */}
      {!search.trim() && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-in">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id as any);
                setOffset(0);
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${
                category === cat.id 
                  ? `bg-${cat.color}/10 border-${cat.color} text-text-primary shadow-${cat.color}/20` 
                  : "bg-surface/50 border-surface-2 text-text-muted hover:text-text-primary hover:border-surface-2/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-10 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Optional: You could reset category to 'all' or 'trending' when searching starts
          }}
          placeholder={category === 'trending' ? "Busca tendencias..." : "Busca en el catálogo..."}
          className="w-full px-5 py-4 pl-12 rounded-xl bg-surface/50 border border-surface-2 text-text-primary placeholder:text-text-muted text-sm outline-none focus:bg-surface focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all font-medium shadow-inner"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Grid */}
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
          {games.map((game, i) => (
            <div
              key={`${game.id}-${i}`}
              className="animate-slide-up opacity-0"
              style={{
                animationDelay: `${Math.min((i % 20) * 0.05, 0.5)}s`,
                animationFillMode: "forwards"
              }}
            >
              <GameCard game={game} />
            </div>
          ))}
          
          {loading && (
            <>
              {[...Array(5)].map((_, i) => (
                 <Skeleton key={`skel-${i}`} className="aspect-[3/4] rounded-xl w-full" />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          {loading ? (
             <div className="flex justify-center mb-4">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-accent-purple animate-spin" />
             </div>
          ) : (
            <>
              <div className="inline-flex w-16 h-16 rounded-full bg-surface-2/50 items-center justify-center mb-4 text-text-muted">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-lg text-text-secondary">No se encontraron juegos con ese nombre.</p>
            </>
          )}
        </div>
      )}

      {/* Load More Action */}
      {hasMore && !loading && games.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            className="px-8 py-3 rounded-full text-sm font-semibold bg-surface border border-surface-2 text-text-primary hover:bg-surface-2 transition-colors neon-border"
          >
            Cargar más juegos
          </button>
        </div>
      )}
    </div>
  );
}
