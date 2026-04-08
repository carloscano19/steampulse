import type { Metadata } from "next";
import { getFCYouTubeContent, getFCGameNews } from "@/lib/news-aggregator";
import { ShortsGrid } from "@/components/fc/ShortsGrid";
import { TwitterFeed } from "@/components/fc/TwitterFeed";
import Image from "next/image";

export const metadata: Metadata = {
  title: "EA Sports FC VIP | StreamPulse",
  description: "Acceso total al mundo del EA Sports FC: Filtraciones, Shorts de creadores top y novedades del mercado.",
};

export const dynamic = 'force-dynamic';

export default async function FCPage() {
  const [shorts, news] = await Promise.all([
    getFCYouTubeContent(10),
    getFCGameNews(6)
  ]);

  return (
    <div className="relative min-h-screen bg-[#070e0a]">
      {/* Soccer-themed background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/30 text-accent-green text-xs font-black mb-6 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            EA FC VIP Access
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-[0.9]">
            Fútbol <br />
            <span className="text-accent-green underline decoration-4 underline-offset-8">Inteligencia</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Filtraciones exclusivas, tácticas de pro-players y los mejores Shorts de la comunidad. 
            Tu zona VIP para dominar el EA Sports FC.
          </p>
        </div>
      </section>

      {/* Galácticos Shorts Grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">
                Camerino Galáctico
              </h2>
              <p className="text-text-muted mt-1 uppercase text-xs tracking-[0.2em] font-bold">Shorts & Directos: DjMaRiiO, JeyRuiz, Lamberman y más</p>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Contenido Real-Time</span>
               <div className="w-12 h-1 rounded-full bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          {shorts.length > 0 ? (
            <ShortsGrid videos={shorts} />
          ) : (
            <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-surface-2">
              <p className="text-text-muted">Buscando nuevos vídeos en el vestuario...</p>
            </div>
          )}
        </div>
      </section>

      {/* Social & News Hub */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-10 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: News Feed */}
            <div className="lg:col-span-2">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-accent-green" />
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                    Filtraciones & Mercado
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {news.map((item) => (
                   <a 
                     key={item.id}
                     href={item.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group p-6 glass rounded-2xl border border-surface-2 hover:border-accent-green/40 transition-all duration-300 flex flex-col"
                   >
                     <div className="flex items-center gap-3 mb-4">
                       <span className="px-2 py-0.5 rounded text-[10px] font-black bg-accent-green/10 text-accent-green border border-accent-green/20">LEAK</span>
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.source}</span>
                     </div>
                     <h3 className="text-base font-bold text-text-primary group-hover:text-accent-green transition-colors leading-tight mb-4">
                       {item.title}
                     </h3>
                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-2/30">
                       <span className="text-[10px] font-bold text-text-muted-dark uppercase italic tracking-widest">Ver Detalles</span>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-green opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                     </div>
                   </a>
                 ))}
               </div>
            </div>

            {/* Right: Social Hub (Twitter) */}
            <div className="lg:col-span-1">
               <TwitterFeed username="FutSheriff" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
