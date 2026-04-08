"use client";

import { useState, useMemo, useEffect } from "react";
import type { NewsArticle } from "@/types";
import { searchDeepNewsAction } from "@/app/actions/news";

const CATEGORIES = ["All", "PC", "PS5", "Xbox", "Switch"];

export function NewsPortal({ initialNews }: { initialNews: NewsArticle[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [deepNews, setDeepNews] = useState<NewsArticle[]>([]);
  const [isSearchingDeep, setIsSearchingDeep] = useState(false);

  // Client-side filtering logic
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
  }, [initialNews, activeTab, search]);

  // Deep Search logic
  useEffect(() => {
    if (search.length >= 3 && filteredLocalNews.length === 0) {
      const handler = setTimeout(async () => {
        setIsSearchingDeep(true);
        try {
          // Parallel fetching for performance
          // Use a random offset or alternate category for Home diversity
          const randomOffset = Math.floor(Math.random() * 10);
          
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${
                activeTab === cat 
                  ? "bg-accent-blue/10 border-accent-blue text-text-primary shadow-accent-blue/20" 
                  : "bg-surface/50 border-surface-2 text-text-muted hover:text-text-primary hover:border-surface-2/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar noticias..."
            className="w-full px-5 py-3 pl-12 rounded-xl bg-surface/50 border border-surface-2 text-text-primary placeholder:text-text-muted text-sm outline-none focus:bg-surface focus:border-accent-blue transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {isSearchingDeep && (
           <div className="absolute inset-0 z-50 rounded-2xl bg-background/50 backdrop-blur-sm flex flex-col items-center pt-24 text-center animate-fade-in">
              <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-accent-blue animate-spin mb-4" />
              <p className="text-lg font-bold text-text-primary tracking-tight">Escaneando la red para "{search}"...</p>
           </div>
        )}

        {displayNews.length > 0 ? displayNews.map((item, index) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group block glass rounded-2xl border border-surface-2 overflow-hidden hover:border-accent-blue/50 transition-all duration-300 hover:-translate-y-1 ${index === 0 && activeTab === 'All' && !search ? 'md:col-span-2 lg:col-span-2' : ''}`}
          >
            <div className={`relative ${index === 0 && activeTab === 'All' && !search ? 'aspect-[21/9]' : 'aspect-video'} overflow-hidden`}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-muted opacity-20"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-4 left-4">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-background/80 backdrop-blur-md border border-surface-2 text-accent-${item.badgeAccent || 'blue'}`}>
                    {item.source}
                 </span>
              </div>
            </div>

            <div className="p-6">
              <h2 className={`${index === 0 && activeTab === 'All' ? 'text-2xl' : 'text-lg'} font-bold text-text-primary mb-3 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-blue group-hover:to-accent-purple transition-all`}>
                {item.title}
              </h2>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                 <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>{item.time}</span>
                 </div>
                 <span className="font-bold flex items-center gap-1 group-hover:text-accent-blue transition-colors">
                    Leer más <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </span>
              </div>
            </div>
          </a>
        )) : (
          <div className="col-span-full py-24 text-center glass rounded-2xl border border-dashed border-surface-2 animate-fade-in">
             <p className="text-text-muted font-medium italic">No hay noticias recientes para esta plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
}
