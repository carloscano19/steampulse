import { getAggregatedNews } from "@/lib/news-aggregator";
import Link from "next/link";
import { Zap } from "lucide-react";

export async function NewsTicker() {
  let news = [];
  try {
    // Only grab 6 headlines to rotate smoothly
    news = await getAggregatedNews(6);
  } catch (err) {
    console.error("NewsTicker failed to load:", err);
    return null;
  }

  if (!news || news.length === 0) return null;

  return (
    <div className="w-full bg-surface-2/30 border-b border-surface-2 overflow-hidden flex items-center h-10 relative z-40 backdrop-blur-md">
      <div className="flex items-center justify-center bg-accent-purple px-4 h-full relative z-20 shadow-[10px_0_20px_rgba(15,23,42,0.8)] shrink-0">
        <Zap className="w-4 h-4 text-white animate-pulse-live" />
        <span className="ml-2 text-xs font-black text-white tracking-widest uppercase">Live News</span>
      </div>
      
      {/* Marquee Wrapper */}
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        {/* Left fade out mask */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        
        {/* Animated track */}
        <div className="animate-marquee flex items-center whitespace-nowrap will-change-transform">
          {news.map((item, i) => (
             <Link 
                key={`news-a-${i}`} 
                href={item.url} 
                target="_blank"
                className="inline-flex items-center gap-2 mx-8 text-sm group hover:text-accent-purple transition-colors"
             >
                <span className="text-accent-blue font-bold text-xs uppercase opacity-70 group-hover:opacity-100">{item.source}</span>
                <span className="text-text-primary group-hover:text-white">{item.title}</span>
             </Link>
          ))}
          {/* Dummy clone for seamless loop */}
          {news.map((item, i) => (
             <Link 
                key={`news-b-${i}`} 
                href={item.url} 
                target="_blank"
                className="inline-flex items-center gap-2 mx-8 text-sm group hover:text-accent-purple transition-colors"
             >
                <span className="text-accent-blue font-bold text-xs uppercase opacity-70 group-hover:opacity-100">{item.source}</span>
                <span className="text-text-primary group-hover:text-white">{item.title}</span>
             </Link>
          ))}
        </div>
        
        {/* Right fade out mask */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  );
}
