import type { Metadata } from "next";
import { getTopTwitchStreams } from "@/lib/api/twitch";
import { getEliteChannelVideos } from "@/lib/news-aggregator";
import { VideoGrid } from "@/components/games/VideoGrid";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Creators | StreamPulse",
  description: "Descubre los creadores de contenido más destacados en español. Streams en directo, categorías y audiencia real.",
};

export const revalidate = 300; // Refrescar cada 5 minutos

export default async function CreatorsPage() {
  const [streams, eliteVideos] = await Promise.all([
    getTopTwitchStreams(20),
    getEliteChannelVideos(5) // 5 videos por canal (Total ~25)
  ]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#9146FF] to-accent-blue" />
            <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">Creators Hub</h1>
          </div>
          <p className="text-text-secondary text-lg">Los directos más potentes de la comunidad hispana ahora mismo.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2/30 border border-surface-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Explorando {streams.length} directos</span>
        </div>
      </div>

      {/* Elite Reviewers Section */}
      {eliteVideos && eliteVideos.length > 0 && (
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accent-purple to-accent-blue" />
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Elite Reviewers Board</h2>
            <span className="ml-3 px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple text-[10px] font-bold border border-accent-purple/20 uppercase tracking-widest animate-pulse">Destacados</span>
          </div>
          <VideoGrid videos={eliteVideos} />
        </div>
      )}

      {/* Live Now Secondary Header */}
      <div className="flex items-center gap-3 mb-8">
         <div className="w-1 h-6 rounded-full bg-[#9146FF]" />
         <h2 className="text-xl font-bold text-text-primary uppercase tracking-tight">Live Now (Twitch)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {streams.map((stream) => (
          <a
            key={stream.id}
            href={`https://twitch.tv/${stream.user_login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block glass rounded-2xl border border-surface-2 overflow-hidden hover:border-[#9146FF]/50 hover:shadow-2xl hover:shadow-[#9146FF]/10 transition-all duration-300 hover:-translate-y-2"
          >
            {/* Thumbnail Wrapper */}
            <div className="relative aspect-video overflow-hidden">
              <Image 
                src={stream.thumbnail_url} 
                alt={stream.title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              
              {/* Badge LIVE */}
              <div className="absolute top-3 left-3 bg-red-600 animate-pulse text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1.5 shadow-xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 LIVE
              </div>

              {/* Viewers */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-bold drop-shadow-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                {stream.viewer_count.toLocaleString()}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9146FF] to-accent-blue p-[2px]">
                   <div className="w-full h-full rounded-full bg-surface-2 flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-bold text-white uppercase">{stream.user_name.charAt(0)}</span>
                   </div>
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-text-primary font-bold truncate group-hover:text-[#9146FF] transition-colors">{stream.user_name}</h3>
                   <p className="text-[#10B981] text-[11px] font-bold uppercase tracking-tight">{stream.game_name}</p>
                 </div>
              </div>
              <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed h-10 italic">
                "{stream.title}"
              </p>
              
              <div className="mt-4 pt-4 border-t border-surface-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Ver en Twitch</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-text-muted group-hover:text-[#9146FF] transform group-hover:translate-x-1 transition-all"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
