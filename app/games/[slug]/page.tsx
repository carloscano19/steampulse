import type { Metadata } from "next";
import { getGameBySlug } from "@/lib/api/igdb";
import { getGameStreams } from "@/lib/api/twitch";
import { getGameSpecificNews, getGameGuides, getGameYouTubeVideos } from "@/lib/news-aggregator";
import { VideoGrid } from "@/components/games/VideoGrid";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const game = await getGameBySlug(slug);
    
    if (!game) return { title: "Game Not Found" };
    
    return {
      title: game.name,
      description: game.summary,
    };
  } catch {
    return { title: "StreamPulse — Game" };
  }
}

export const revalidate = 300; // ISR: cache 5 minutes for game detail pages

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  let game;
  try {
    game = await getGameBySlug(slug);
  } catch (err) {
    console.error("IGDB fetch failed for slug:", slug, err);
    game = null;
  }

  if (!game) {
    notFound();
  }

  // Cross-reference Live data — use allSettled so one API failure doesn't crash the whole page
  const [newsResult, streamsResult, guidesResult, ytResult] = await Promise.allSettled([
    getGameSpecificNews(game.name, 3),
    getGameStreams(game.name, 3),
    getGameGuides(game.name, 3),
    getGameYouTubeVideos(game.name, 3)
  ]);

  const bgImage = game.cover_url ? game.cover_url.replace("t_cover_big", "t_1080p") : "";

  // Helper to ensure components always have an image (fallback to game's cover/background if Google News strips it)
  const applyFallbackImage = (item: any) => ({
    ...item,
    imageUrl: item.imageUrl || bgImage || game.cover_url || ""
  });

  const relatedNews = newsResult.status === "fulfilled" ? newsResult.value.map(applyFallbackImage) : [];
  const streams = streamsResult.status === "fulfilled" ? streamsResult.value : [];
  const gameGuides = guidesResult.status === "fulfilled" ? guidesResult.value.map(applyFallbackImage) : [];
  const youtubeVideos = ytResult.status === "fulfilled" ? ytResult.value.map(applyFallbackImage) : [];

  const releaseYear = game.release_date
    ? new Date(game.release_date).getFullYear()
    : "TBA";
  
  

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 z-0 h-[60vh] sm:h-[70vh] w-full overflow-hidden">
        {bgImage && (
          <Image src={bgImage} alt="Background" fill className="object-cover opacity-20 blur-sm scale-110" unoptimized />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20 lg:flex gap-12">
        {/* Left Column */}
        <div className="lg:w-1/3 xl:w-1/4 mb-10 lg:mb-0 flex-shrink-0 animate-slide-up">
          <Link href="/games" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 text-sm">
            <span>←</span> Volver al catálogo
          </Link>
          
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl neon-border">
            {game.cover_url ? (
               <Image src={game.cover_url} alt={game.name} fill className="object-cover" priority unoptimized />
            ) : (
               <div className="w-full h-full bg-surface-2/50 flex items-center justify-center">
                 <span className="text-text-muted">No Cover</span>
               </div>
            )}

            {game.rating && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-xl text-lg font-[family-name:var(--font-rajdhani)] font-bold shadow-2xl backdrop-blur-md bg-black/60" style={{ border: "1px solid rgba(16, 185, 129, 0.5)", color: "#10B981" }}>
                  ★ {game.rating}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="lg:w-2/3 xl:w-3/4 lg:pt-14 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {game.genres?.slice(0, 3).map((genre) => (
              <span key={genre} className="px-3 py-1 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30 text-xs font-semibold tracking-wide">
                {genre}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full bg-surface-2 text-text-secondary text-xs font-semibold">
              {releaseYear}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-text-primary mb-2 leading-tight">
            {game.name}
          </h1>

          {game.companies && game.companies.length > 0 && (
            <p className="text-text-muted text-sm mb-6">
              Desarrollado por <span className="text-text-secondary font-medium">{game.companies.slice(0, 3).join(", ")}</span>
            </p>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {game.platforms.map((plat) => (
                <span key={plat} className="text-xs font-medium text-text-muted bg-surface px-2 py-1 rounded-md border border-surface-2">
                  {plat}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="glass rounded-xl p-6 md:p-8 neon-border mb-8 max-w-4xl">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-blue"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Sinopsis
            </h3>
            <p className="text-text-secondary leading-relaxed md:text-lg">
              {game.summary || "No hay sinopsis disponible para este juego en la base de datos de IGDB."}
            </p>
          </div>

          {/* COMPREHENSIVE HELP & GUIDES HUB */}
          {((gameGuides && gameGuides.length > 0) || (youtubeVideos && youtubeVideos.length > 0)) && (
            <div className="mb-12 max-w-4xl p-5 md:p-8 rounded-3xl border border-[#EAB308]/20 bg-gradient-to-br from-surface-2/40 via-surface/40 to-[#EAB308]/5 relative overflow-hidden shadow-2xl shadow-background">
               {/* Ambient Glow */}
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#EAB308]/10 rounded-full blur-3xl pointer-events-none" />

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                 <div>
                   <h3 className="text-2xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tight">
                     <span className="p-2 rounded-xl bg-gradient-to-br from-[#EAB308]/20 to-[#EAB308]/5 border border-[#EAB308]/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#EAB308]"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                     </span>
                     Help & Guides Hub
                   </h3>
                   <p className="text-sm text-text-secondary mt-2">Tutoriales, videoguías y acceso a enciclopedias oficiales del juego.</p>
                 </div>
                 
                 {/* Official Wiki Mega Button */}
                 <a 
                    href={`https://duckduckgo.com/?q=site:fandom.com+OR+site:fextralife.com+OR+site:ign.com/wikis+"${encodeURIComponent(game.name)}"`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#EAB308] to-yellow-500 text-surface-dark font-extrabold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#EAB308]/20 whitespace-nowrap"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    Buscar en Wikis Oficiales
                 </a>
               </div>

               {/* Video Guides Section */}
               {youtubeVideos && youtubeVideos.length > 0 && (
                 <div className="mb-8 relative z-10">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" /> Videoguías y Gameplays
                    </h4>
                    <VideoGrid videos={youtubeVideos} />
                 </div>
               )}

               {/* Textual Guides Subgrid */}
               {gameGuides && gameGuides.length > 0 && (
                 <div className="relative z-10 border-t border-surface-2/40 pt-6">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" /> Artículos de Ayuda Recientes
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                       {gameGuides.map((guide) => (
                          <a href={guide.url} target="_blank" rel="noopener noreferrer" key={guide.id} className="flex flex-col rounded-xl border border-surface-2 bg-surface/30 hover:bg-surface/60 hover:border-[#EAB308]/30 transition-all overflow-hidden group hover:-translate-y-0.5">
                             {guide.imageUrl && (
                               <div className="h-28 w-full relative overflow-hidden bg-surface-2">
                                  <img src={guide.imageUrl} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                               </div>
                             )}
                             <div className="p-4 flex flex-col flex-1">
                               <span className="w-fit inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-2 bg-surface border border-surface-2 text-text-secondary">
                                 {guide.source}
                               </span>
                               <h5 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-3 group-hover:text-[#EAB308] transition-colors">{guide.title}</h5>
                             </div>
                          </a>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Related News Cross-reference */}
          {relatedNews.length > 0 && (
             <div className="mb-10 max-w-4xl">
               <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-purple"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                 Noticias Relacionadas
               </h3>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedNews.map((news) => (
                      <a href={news.url} target="_blank" rel="noopener noreferrer" key={news.id} className="block glass p-4 rounded-xl border border-surface-2 hover:border-accent-purple/50 transition-all hover:scale-[1.02]">
                         {news.imageUrl && (
                            <div className="aspect-video w-full rounded-lg h-24 mb-3 overflow-hidden">
                               <img src={news.imageUrl} alt="" className="object-cover w-full h-full" />
                            </div>
                         )}
                         <span className={`text-[10px] uppercase font-bold text-accent-${news.badgeAccent || 'blue'} mb-1 block`}>{news.source}</span>
                         <h4 className="text-sm font-medium text-text-primary line-clamp-3">{news.title}</h4>
                      </a>
                  ))}
               </div>
             </div>
          )}

          {/* YouTube Trailer Video integration */}
          {game.videoId && (
            <div className="mb-10 max-w-4xl">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF0000]"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.01 29.01 0 0 0 1 11.75a29.01 29.01 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29.01 29.01 0 0 0 .46-5.33 29.01 29.01 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>
                Tráiler Oficial
              </h3>
              <div className="relative aspect-video rounded-xl overflow-hidden glass neon-border shadow-2xl">
                 <iframe 
                   src={`https://www.youtube.com/embed/${game.videoId}?autoplay=0&rel=0`}
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                   className="absolute inset-0 w-full h-full border-0"
                 ></iframe>
              </div>
            </div>
          )}

          {/* Twitch Live Streams Integration */}
          {streams && streams.length > 0 && (
            <div className="mb-10 max-w-4xl">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#9146FF]"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" /></svg>
                Directos en Twitch (Español)
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {streams.map((stream) => (
                    <a href={`https://twitch.tv/${stream.user_name}`} target="_blank" rel="noopener noreferrer" key={stream.id} className="block glass p-3 rounded-xl border border-surface-2 hover:border-[#9146FF]/50 transition-all hover:-translate-y-1 group">
                       <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                          <Image src={stream.thumbnail_url} alt={stream.title} fill className="object-cover" unoptimized />
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                          </div>
                       </div>
                       <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{stream.user_name}</h4>
                       <p className="text-xs text-text-muted line-clamp-1 mb-2">{stream.title}</p>
                       <div className="flex items-center gap-1 text-[#10B981] text-xs font-medium">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          {stream.viewer_count.toLocaleString()} espectadores
                       </div>
                    </a>
                 ))}
              </div>
            </div>
          )}

          {/* Screenshots Grid */}
          {game.screenshots && game.screenshots.length > 0 && (
            <div className="mb-10 max-w-4xl">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-green"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Capturas de Juego
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {game.screenshots.slice(0, 6).map((shot, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-surface-2 hover:border-accent-purple transition-colors">
                    <Image src={shot} alt={`${game.name} screenshot ${idx + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
