"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function TwitterFeed({ username = "FutSheriff" }: { username?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const checkLoaded = () => {
      // Si detectamos que Twitter ha inyectado el iframe o ha procesado el elemento
      const hasIframe = document.querySelector(`iframe[id^="twitter-widget-"]`);
      if (hasIframe) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Intentar forzar la carga del widget periódicamente
    const interval = setInterval(() => {
      if (!checkLoaded()) {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
        setErrorCount(v => v + 1);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [username]);

  const showFallback = errorCount > 4 && !isLoaded;

  return (
    <div className="glass rounded-3xl border border-surface-2 overflow-hidden h-full min-h-[600px] flex flex-col shadow-[0_0_40px_rgba(29,155,240,0.1)]">
      <Script 
        src="https://platform.twitter.com/widgets.js" 
        strategy="afterInteractive"
        onLoad={() => {
          if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
          }
        }}
      />
      
      <div className="p-5 border-b border-surface-2 flex items-center justify-between bg-surface-1/50 font-[family-name:var(--font-rajdhani)]">
        <div className="flex items-center gap-3">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#1D9BF0]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
           <h3 className="text-sm font-bold text-white uppercase tracking-wider italic">Social Hub Live</h3>
        </div>
        <span className="text-[10px] font-bold text-text-muted-dark uppercase tracking-widest">vía @{username}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-black/20 min-h-[500px] flex flex-col items-center">
        {!showFallback ? (
          <div className="w-full flex flex-col items-center py-4" key={`${username}-${errorCount}`}>
            <a 
              className="twitter-timeline" 
              data-theme="dark" 
              data-chrome="noheader nofooter noborders transparent"
              data-height="800"
              href={`https://twitter.com/${username}?ref_src=twsrc%5Etfw`}
            >
              <div className="p-10 text-center animate-pulse">
                 <div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-text-muted text-xs italic tracking-widest">Sincronizando filtraciones...</p>
              </div>
            </a>
          </div>
        ) : (
          <div className="p-8 text-center animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-surface-2/20 rounded-full flex items-center justify-center mb-6 border border-surface-2 animate-bounce">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-green"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-tighter">Acceso Restringido</h4>
            <p className="text-text-secondary text-xs mb-8 leading-relaxed max-w-[240px]">
              El feed de X.com está siendo bloqueado externamente. Usa el botón inferior para ver las últimas cartas y leaks.
            </p>
            <a 
              href={`https://twitter.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl bg-accent-green text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Abrir en X.com ⚡
            </a>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-surface-2/10 text-center border-t border-surface-2/20">
        <p className="text-[9px] text-text-muted italic tracking-tighter uppercase opacity-50">Pulse Intelligence Data • EA FC Core</p>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    twttr: any;
  }
}
