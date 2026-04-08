"use client";

import { useState } from "react";
import type { NewsArticle } from "@/types";

interface VideoArticle extends NewsArticle {
  videoId?: string;
}

export function ShortsGrid({ videos }: { videos: VideoArticle[] }) {
  const [selectedVideo, setSelectedVideo] = useState<VideoArticle | null>(null);

  const openVideo = (video: VideoArticle) => {
    if (video.videoId) {
      setSelectedVideo(video);
    } else {
      window.open(video.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {videos.map((video, idx) => (
          <div
            key={video.id || idx}
            onClick={() => openVideo(video)}
            className="group cursor-pointer relative aspect-[9/16] rounded-2xl overflow-hidden border border-surface-2 hover:border-accent-green/50 transition-all duration-300 hover:-translate-y-1 bg-surface-1 shadow-lg"
          >
            {/* Thumbnail */}
            {video.imageUrl ? (
              <img 
                src={video.imageUrl} 
                alt={video.title} 
                className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-accent-green/20" />
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-accent-green text-black flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>

            {/* Content info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black bg-accent-green text-black uppercase">
                   {video.source}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                {video.title}
              </h4>
            </div>
            
            {/* "Live" corner badge if relevant or just SHORTS tag */}
            <div className="absolute top-3 right-3">
               <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" title="Nuevo contenido" />
            </div>
          </div>
        ))}
      </div>

      {/* Vertical Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
          
          <div 
            className="relative w-full max-w-sm aspect-[9/16] glass rounded-3xl border border-surface-2 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.2)] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-accent-green text-white flex items-center justify-center transition-all border border-surface-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
               <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-accent-green uppercase tracking-widest">{selectedVideo.source}</span>
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-xs text-white/60">EA Sports FC</span>
               </div>
               <h3 className="text-base font-bold text-white leading-tight">{selectedVideo.title}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
