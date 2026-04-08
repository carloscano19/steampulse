import type { Metadata } from "next";
import { searchGames } from "@/lib/api/igdb";
import { GameGrid } from "@/components/games/GameGrid";

export const metadata: Metadata = {
  title: "Games",
  description: "Catálogo de más de 500.000 videojuegos. Busca, filtra y descubre tu próximo juego favorito.",
};

export const revalidate = 3600; // ISR cache for generic SSR catalog renders

export default async function GamesPage() {
  // Fetch initial popular/trending games from IGDB server-side before render
  let initialGames: import("@/types").Game[] = [];
  try {
    initialGames = await searchGames("", 20, 0);
  } catch (error) {
    console.error("Games SSR load error:", error);
  }

  return (
    <div className="relative particles-bg min-h-screen">
       {/* Hero Section */}
       <section className="relative z-10 pt-16 pb-10 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-medium mb-6 animate-fade-in">
            🕹️ IGDB CATALOG EXPLORER
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-rajdhani)] font-bold mb-4 animate-slide-up">
            <span className="text-text-primary">Explora el Catálogo de </span>
            <span className="gradient-text">Juegos</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Impulsado por IGDB. Búsqueda semántica instantánea, portadas en alta resolución y data actualizada de más de medio millón de títulos.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-6 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <GameGrid initialGames={initialGames} />
        </div>
      </section>
    </div>
  );
}
