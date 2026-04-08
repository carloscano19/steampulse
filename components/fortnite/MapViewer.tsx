"use client";

import { useState } from "react";
import Image from "next/image";

interface MapViewerProps {
  imageUrl: string;
  pois?: { id: string; name: string; x: number; y: number }[];
}

export function MapViewer({ imageUrl, pois = [] }: MapViewerProps) {
  const [scale, setScale] = useState(1);
  const [showPois, setShowPois] = useState(true);
  const [hoveredPoi, setHoveredPoi] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="w-8 h-8 rounded-lg bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center justify-center transition-colors text-sm font-bold"
          >
            −
          </button>
          <span className="text-xs text-text-muted w-12 text-center font-[family-name:var(--font-rajdhani)] font-semibold">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="w-8 h-8 rounded-lg bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center justify-center transition-colors text-sm font-bold"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setShowPois(!showPois)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showPois
              ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/40"
              : "bg-surface text-text-secondary hover:bg-surface-2"
          }`}
        >
          {showPois ? "🗺 POIs ON" : "🗺 POIs OFF"}
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden neon-border" style={{ maxHeight: "600px" }}>
        <div
          className="relative transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${scale})` }}
        >
          <Image
            src={imageUrl}
            alt="Fortnite Current Map"
            width={1024}
            height={1024}
            className="w-full h-auto"
            priority
          />

          {/* POI overlays */}
          {showPois &&
            pois.map((poi) => (
              <div
                key={poi.id}
                className="absolute"
                style={{
                  left: `${poi.x}%`,
                  top: `${poi.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredPoi(poi.id)}
                onMouseLeave={() => setHoveredPoi(null)}
              >
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-accent-blue border-2 border-white/80 shadow-lg cursor-pointer hover:scale-150 transition-transform" />
                  {hoveredPoi === poi.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg glass text-xs font-medium text-text-primary whitespace-nowrap z-10 animate-fade-in">
                      {poi.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
