"use client";

import { useState } from "react";
import type { NewsArticle } from "@/types";
import Image from "next/image";

interface VideoArticle extends NewsArticle {
  videoId?: string;
}

export function VideoGrid({ videos }: { videos: VideoArticle[] }) {
  const [selectedVideo, setSelectedVideo] = useState<VideoArticle | null>(null);

  const openVideo = (video: VideoArticle) => {
    // If we don't have a direct videoId (from Google News RSS), we'll try to extract it
    if (!video.videoId && video.url) {
       const match = video.url.match(/(?:v=|be\/|embed\/)([^&?]+)/);
       if (match) video.videoId = match[1];
    }
    
    if (video.videoId) {
      setSelectedVideo(video);
    } else {
      window.open(video.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, idx) => (
          <div
            key={video.id || idx}
            onClick={() => openVideo(video)}
            className="group cursor-pointer glass rounded-2xl border border-surface-2 overflow-hidden hover:border-accent-purple/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-video overflow-hidden">
               {video.imageUrl ? (
                  <img 
                    src={video.imageUrl} 
                    alt={video.title} 
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-500" 
                  />
               ) : (
                  <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted opacity-20"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77.42-1.56.42-4.81.42-4.81s0-3.25-.42-4.81zM10 15V9l5 3-5 3z"/></svg>
                  </div>
               )}
               
               {/* Play Overlay */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                  <div className="w-16 h-16 rounded-full bg-accent-purple text-white flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
               </div>

               <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-background/80 backdrop-blur-md border border-surface-2 text-accent-purple">
                     {video.source}
                  </span>
               </div>
            </div>

            <div className="p-5">
              <h4 className="text-sm font-bold text-text-primary line-clamp-2 leading-tight group-hover:text-accent-purple transition-colors">
                {video.title}
              </h4>
              <p className="text-[10px] text-text-muted mt-2 uppercase tracking-widest font-medium">
                {video.time} • Analizado por {video.source}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
          
          <div 
            className="relative w-full max-w-5xl aspect-video glass rounded-3xl border border-surface-2 overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface/50 hover:bg-accent-purple text-white flex items-center justify-center transition-all border border-surface-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
               <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-purple text-white">RESEÑA ÉLITE</span>
                  <span className="text-sm font-bold text-white/90">{selectedVideo.source}</span>
               </div>
               <h3 className="text-xl font-bold text-white leading-tight">{selectedVideo.title}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
