import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types";

export function GameCard({ game }: { game: Game }) {
  // Extract year for display
  const releaseYear = game.release_date
    ? new Date(game.release_date).getFullYear()
    : "TBA";

  const primaryGenre = game.genres?.[0];

  return (
    <Link href={`/games/${game.slug}`} className="block h-full group">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden card-hover neon-border glass bg-surface-2/30 h-full flex flex-col">
        {/* Cover Art Image */}
        <div className="relative flex-1 bg-surface-2/50 w-full overflow-hidden">
          {game.cover_url ? (
            <Image
              src={game.cover_url}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              unoptimized // Allow IGDB images strictly
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-surface-2 mb-2" strokeWidth="1.5">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 12h4M8 10v4" />
                <circle cx="15" cy="11" r="1" />
                <circle cx="18" cy="13" r="1" />
              </svg>
              <span className="text-xs text-text-muted">No Cover Available</span>
            </div>
          )}

          {/* Top Info Overlays (Rating/Score) */}
          {game.rating && (
            <div className="absolute top-2 right-2">
              <span
                className="px-2 py-1 rounded-lg text-xs font-[family-name:var(--font-rajdhani)] font-bold shadow-lg"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#10B981",
                }}
              >
                {game.rating}
              </span>
            </div>
          )}

          {/* Gradient Overlay for info block legibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Content Block */}
        <div className="absolute bottom-0 w-full p-4 flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">
            {game.name}
          </h3>
          <div className="flex items-center justify-between mt-1 opacity-90 transition-opacity group-hover:opacity-100">
            {primaryGenre && (
              <span className="text-xs text-text-secondary truncate pr-2">
                {primaryGenre}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              {releaseYear}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
