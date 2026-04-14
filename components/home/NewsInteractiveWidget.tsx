"use client";

import { useState, useMemo, useEffect } from "react";
import type { NewsArticle } from "@/types";
import Link from "next/link";
import { searchDeepNewsAction } from "@/app/actions/news";

const CATEGORIES = ["All", "PC", "PS5", "Xbox", "Switch"];

export function NewsInteractiveWidget({ initialNews }: { initialNews: NewsArticle[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [deepNews, setDeepNews] = useState<NewsArticle[]>([]);
  const [isSearchingDeep, setIsSearchingDeep] = useState(false);

  // Client-side filtering logic for initial news
  const filteredLocalNews = useMemo(() => {
    return initialNews.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      
      let matchesCategory = true;
      if (activeTab !== "All") {
        const titleLower = item.title.toLowerCase();
        
        const SYNONYMS: Record<string, string[]> = {
           "PC": ["steam", "epic", "ordenador", "pc", "windows", "rtx"],
           "PS5": ["playstation", "ps5", "sony", "ps4", "dualshock", "dualsense"],
           "Xbox": ["xbox", "microsoft", "game pass", "series x", "series s"],
           "Switch": ["switch", "nintendo", "mario", "zelda", "pokémon", "pokemon"]
        };

        const targetKeywords = SYNONYMS[activeTab] || [activeTab.toLowerCase()];
        const inTitle = targetKeywords.some(kw => titleLower.includes(kw));
        const inPlatforms = item.igdbMatch?.platforms?.some(p => 
           targetKeywords.some(kw => p.toLowerCase().includes(kw))
        );
        
        matchesCategory = Boolean(inTitle || inPlatforms);
      }

      return matchesSearch && matchesCategory;
    });
  }, [initialNews, search, activeTab]);

  // Deep Search logic: if local search fails, scan the web
  useEffect(() => {
    if (search.length >= 3 && filteredLocalNews.length === 0) {
      const handler = setTimeout(async () => {
        setIsSearchingDeep(true);
        try {
          const results = await searchDeepNewsAction(search);
          setDeepNews(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearchingDeep(false);
        }
      }, 800);
      return () => clearTimeout(handler);
    } else {
      setDeepNews([]);
    }
  }, [search, filteredLocalNews.length]);

  const displayNews = search.length >= 3 && filteredLocalNews.length === 0 ? deepNews : filteredLocalNews;

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center animate-slide-up">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
           <input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search news..."
             className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-2 text-text-primary text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
           />
           <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
           </svg>
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === cat 
                  ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20" 
                  : "bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-2/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4 relative">
        {isSearchingDeep && (
           <div className="absolute inset-0 z-50 rounded-xl bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-accent-blue animate-spin mb-4" />
              <p className="text-sm font-bold text-text-primary tracking-tight">Escaneando la red para "{search}"...</p>
              <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-widest">Búsqueda profunda activada</p>
           </div>
        )}

        {displayNews.length > 0 ? displayNews.slice(0, 5).map((item: NewsArticle, index: number) => (
          <div
            key={item.id}
            onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
            className="flex items-start sm:items-center gap-4 p-4 rounded-xl backdrop-blur-xl bg-surface/30 border border-surface-2 group transition-all duration-300 hover:border-accent-purple/50 hover:shadow-lg hover:-translate-y-1 hover:bg-surface/50 cursor-pointer animate-slide-up"
          >
            <div className="w-16 h-16 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 border border-surface-2 group-hover:border-accent-blue transition-colors overflow-hidden relative shadow-inner mt-1 sm:mt-0">
              {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
              ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-blue"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              )}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-purple group-hover:to-accent-blue transition-all leading-snug">
                <span className="hover:underline">{item.title}</span>
              </h3>
              
              <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-surface-2 border border-surface-2 text-accent-${item.badgeAccent || 'blue'}`}>
                    {item.source}
                </span>
                <span>•</span>
                <span>{item.time}</span>
              </div>

              {/* IGDB Intelligence Mini-Card */}
              {item.igdbMatch && (
                 <div className="mt-3 flex items-center gap-3 animate-fade-in delay-150">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold shadow-sm">
                       ⭐ {item.igdbMatch.rating}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-surface border border-surface-2 text-text-primary text-xs font-medium">
                       {item.igdbMatch.releaseYear}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-80">
                       {item.igdbMatch?.platforms?.map((p: string) => (
                          <span key={p} className="text-[10px] font-bold text-accent-blue uppercase tracking-wider">{p}</span>
                       ))}
                    </div>
                    {item.igdbMatch.name && item.igdbMatch.slug && (
                       <Link 
                          href={`/games/${item.igdbMatch.slug}`} 
                          onClick={(e) => e.stopPropagation()} 
                          title="Ir a la ficha del juego" 
                          className="flex items-center gap-1.5 px-2.5 py-1 ml-auto rounded bg-accent-purple/10 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple hover:text-white transition-colors text-xs font-bold shadow-sm z-10"
                       >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                          <span className="truncate max-w-[120px]">{item.igdbMatch.name}</span>
                       </Link>
                    )}
                 </div>
              )}
            </div>
          </div>
        )) : (
          <div className="py-12 text-center flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border border-surface-2 bg-surface flex items-center justify-center mb-4">
               <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <p className="text-text-muted text-sm">No stories match your exact filters.</p>
          </div>
        )}
        
        {search.length >= 3 && filteredLocalNews.length === 0 && displayNews.length > 0 && (
           <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-accent-blue uppercase tracking-widest animate-fade-in">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Resultados de búsqueda profunda
           </div>
        )}
      </div>
    </div>
  );
}
