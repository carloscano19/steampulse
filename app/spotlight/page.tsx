import type { Metadata } from "next";
import { searchGames, getGameBySlug } from "@/lib/api/igdb";
import { getGameStreams } from "@/lib/api/twitch";
import { getGameSpecificNews, getGameGuides } from "@/lib/news-aggregator";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0; // Ensure live data for the hot trending page

export const metadata: Metadata = {
  title: "Spotlight VIP | StreamPulse",
  description: "El Epicentro de la actualidad. Análisis profundo del juego número 1 del planeta en este instante.",
};

export default async function SpotlightPage() {
  const cookieStore = await cookies();
  const customSpotlightSlug = cookieStore.get("custom_spotlight")?.value;

  let trending: any[] = [];
  
  if (customSpotlightSlug) {
    // 1. Fetch user's handpicked Spotlight VIP
    const customGame = await getGameBySlug(customSpotlightSlug);
    if (customGame) trending = [customGame];
  } 
  
  if (!trending.length) {
    // 2. Fallback to global absolute top #1 trending game
    trending = await searchGames("", 1, 0);
  }

  const spotlightGame = trending && trending.length > 0 ? trending[0] : null;

  if (!spotlightGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Desplegando radares... Vuelve pronto.</p>
      </div>
    );
  }

  // 2. Fetch specific massive data structures for this game
  const [news, streams, guides] = await Promise.all([
    getGameSpecificNews(spotlightGame.name, 4),
    getGameStreams(spotlightGame.name, 3),
    getGameGuides(spotlightGame.name, 3)
  ]);

  const bgImage = spotlightGame.cover_url ? spotlightGame.cover_url.replace("t_cover_big", "t_1080p") : "";

  return (
    <div className="min-h-screen bg-background">
      {/* 1. IMMERSIVE HERO PARALLAX */}
      <section className="relative h-[85vh] flex items-end justify-center overflow-hidden">
        {bgImage && (
          <Image 
            src={bgImage} 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-40 mix-blend-screen scale-105" 
            priority
            unoptimized 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.1),transparent_50%)]" />
        
        <div className="relative z-10 w-full max-w-[1400px] px-4 sm:px-6 lg:px-12 pb-20 text-center animate-slide-up">
           <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#EAB308]/50 bg-[#EAB308]/10 text-[#EAB308] font-bold text-sm tracking-widest uppercase mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
             <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] animate-pulse" />
             Trending #1 Global
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter" style={{ textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
             {spotlightGame.name}
           </h1>
           <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 font-light">
             Descubre por qué todo el mundo está hablando de él. Análisis, guías y los mejores directos hispanos.
           </p>
           <a href={`/games/${spotlightGame.slug}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold uppercase hover:bg-[#EAB308] transition-colors">
             Ver Ficha Técnica Completa
           </a>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 grid lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: GUIDES & LORE (8 cols) */}
        <div className="lg:col-span-8 space-y-16">
           
           {/* Guides Sector */}
           {guides && guides.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 rounded-full bg-[#EAB308]" />
                  <h2 className="text-3xl font-bold text-text-primary">El Tomo de Supervivencia</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {guides.map((guide, idx) => (
                    <a href={guide.url} target="_blank" rel="noopener noreferrer" key={idx} className="block glass p-6 rounded-2xl border border-surface-2 hover:border-[#EAB308] transition-all hover:-translate-y-2 group relative overflow-hidden">
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#EAB308]/10 rounded-full blur-2xl group-hover:bg-[#EAB308]/20 transition-colors" />
                       <span className="inline-block px-3 py-1 bg-[#EAB308] text-black text-xs font-bold uppercase rounded mb-4">
                         {guide.source}
                       </span>
                       <h3 className="text-lg font-semibold text-text-primary leading-tight group-hover:text-[#EAB308] transition-colors">
                         {guide.title}
                       </h3>
                    </a>
                  ))}
                </div>
              </section>
           )}

           {/* Latest News Sector */}
           {news && news.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 rounded-full bg-accent-blue" />
                  <h2 className="text-3xl font-bold text-text-primary">Radar de Noticias</h2>
                </div>
                <div className="space-y-4">
                  {news.map((n, idx) => (
                     <a href={n.url} target="_blank" rel="noopener noreferrer" key={idx} className="flex gap-6 glass p-4 rounded-xl border border-surface-2 hover:bg-surface transition-colors cursor-pointer group">
                        {n.imageUrl && (
                           <div className="relative w-32 md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 border border-surface-2 group-hover:border-accent-blue">
                             <img src={n.imageUrl} alt="" className="object-cover w-full h-full" />
                           </div>
                        )}
                        <div className="flex flex-col justify-center">
                           <span className="text-[10px] uppercase font-bold text-accent-blue mb-2">{n.source} • {n.time}</span>
                           <h4 className="text-base md:text-lg font-semibold text-text-primary line-clamp-2 md:line-clamp-3 group-hover:text-accent-blue transition-colors">
                             {n.title}
                           </h4>
                        </div>
                     </a>
                  ))}
                </div>
              </section>
           )}
        </div>

        {/* RIGHT COLUMN: MEDIA & TWITCH (4 cols) */}
        <div className="lg:col-span-4 space-y-12">
           
           {/* Official Trailer */}
           {spotlightGame.videoId && (
              <div className="glass rounded-2xl p-6 border border-surface-2">
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-red-500"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                   Tráiler Mundial
                 </h3>
                 <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <iframe 
                      src={`https://www.youtube.com/embed/${spotlightGame.videoId}?autoplay=0&rel=0`}
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    ></iframe>
                 </div>
              </div>
           )}

           {/* Live Twitch Audience */}
           <div className="glass rounded-2xl p-6 border border-[#9146FF]/30 backdrop-blur-xl">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#9146FF]"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" /></svg>
                 Audiencia en Vivo
               </h3>
               {streams && streams.length > 0 ? (
                 <div className="space-y-4">
                    {streams.map((stream, idx) => (
                       <a href={`https://twitch.tv/${stream.user_name}`} target="_blank" rel="noopener noreferrer" key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-[#9146FF]/10 transition-colors border border-transparent hover:border-[#9146FF]/30 group">
                          <div className="relative w-20 aspect-video rounded overflow-hidden">
                             <img src={stream.thumbnail_url} alt="" className="object-cover w-full h-full" />
                             <div className="absolute top-1 left-1 bg-red-600 w-2 h-2 rounded-full animate-pulse" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-text-primary truncate group-hover:text-[#9146FF]">{stream.user_name}</h4>
                            <p className="text-xs text-[#10B981] font-semibold">{stream.viewer_count.toLocaleString()} <span className="text-text-muted font-normal">viendo</span></p>
                          </div>
                       </a>
                    ))}
                 </div>
               ) : (
                 <p className="text-sm text-text-muted">No hay emisiones relevantes en español en este momento.</p>
               )}
           </div>

        </div>
      </div>
    </div>
  );
}
