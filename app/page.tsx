import Link from "next/link";
import { searchGames } from "@/lib/api/igdb";
import { getTopTwitchStreams } from "@/lib/api/twitch";
import { getAggregatedNews } from "@/lib/news-aggregator";
import { GameCard } from "@/components/games/GameCard";
import { NewsInteractiveWidget } from "@/components/home/NewsInteractiveWidget";

export const revalidate = 120; // ISR: cache 2 minutes — balances freshness with fast loads

export default async function Home() {
  let trendingGames: import("@/types").Game[] = [];
  let liveStreams: import("@/types").TwitchStream[] = [];
  let news: import("@/types").NewsArticle[] = [];
  
  try {
    // Parallel fetching for performance
    // Use a random offset to ensure Home diversity (SRS 4.3)
    const randomOffset = Math.floor(Math.random() * 50);
    
    const [gamesResult, streamsResult, newsResult] = await Promise.allSettled([
      searchGames("", 6, randomOffset, 'trending'),
      getTopTwitchStreams(4),
      getAggregatedNews(40, true) // skipIGDBMatch=true — home page doesn't need per-article IGDB data
    ]);

    trendingGames = gamesResult.status === "fulfilled" ? gamesResult.value : [];
    liveStreams = streamsResult.status === "fulfilled" ? streamsResult.value : [];
    news = newsResult.status === "fulfilled" ? newsResult.value : [];
  } catch (error) {
    console.error("Home page API parallel error:", error);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-[#1E1B4B] to-accent-purple/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.1),transparent_60%)]" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse-live" />
              NUEVA GENERACIÓN GAMING
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6 animate-slide-up">
              <span className="text-text-primary">Tu universo </span>
              <span className="gradient-text">gaming</span>
              <br />
              <span className="text-text-primary">en un único </span>
              <span className="gradient-text">hub.</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-xl mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Catálogo de videojuegos, tienda diaria de Fortnite, streams en directo,
              clips virales y noticias de la industria. Todo con estética premium.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Ver Radar de Noticias
              </Link>
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-surface-2 text-text-secondary hover:text-text-primary hover:border-surface-2/80 font-medium text-base transition-all hover:bg-surface/50"
              >
                Ver catálogo de juegos
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/30 to-transparent" />
      </section>

      {/* Trending Games Widget */}
      <section className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-purple to-accent-blue" />
            <h2 className="text-2xl font-semibold text-text-primary">Trending Games</h2>
            <Link href="/games" className="ml-auto text-sm text-accent-purple hover:text-accent-blue transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingGames.slice(0, 6).map((game, index) => (
              <div
                key={game.slug}
                className="animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Now + Latest News */}
      <section className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Now */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-green to-accent-blue" />
              <h2 className="text-2xl font-semibold text-text-primary">Live Now</h2>
              <Link href="/creators" className="ml-auto text-sm text-accent-purple hover:text-accent-blue transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-3">
              {liveStreams.map((stream, index) => (
                <a
                  href={`https://twitch.tv/${stream.user_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={stream.id}
                  className="flex items-center gap-4 p-4 rounded-xl glass neon-border animate-slide-up opacity-0 hover:bg-surface-2/50 transition-colors cursor-pointer group"
                  style={{ animationDelay: `${0.6 + index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden neon-border">
                    <img src={stream.thumbnail_url} alt={stream.user_name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-purple transition-colors">
                        {stream.user_name}
                      </h3>
                      <span className="inline-flex flex-shrink-0 items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-live" />
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-1">{stream.title}</p>
                    <p className="text-[10px] font-bold text-accent-purple tracking-widest uppercase mt-0.5 truncate">{stream.game_name}</p>
                  </div>
                  <span className="text-sm font-[family-name:var(--font-rajdhani)] font-bold text-accent-green whitespace-nowrap flex-shrink-0">
                    {new Intl.NumberFormat('es-ES').format(stream.viewer_count)}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Latest News */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-blue to-accent-purple" />
              <h2 className="text-2xl font-semibold text-text-primary">Latest News</h2>
              <Link href="/news" className="ml-auto text-sm text-accent-purple hover:text-accent-blue transition-colors flex-shrink-0">
                Ver todas →
              </Link>
            </div>

            <NewsInteractiveWidget initialNews={news} />
          </div>
        </div>
      </section>

      {/* Fortnite Shop Teaser */}
      <section className="px-4 sm:px-6 lg:px-12 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden neon-border p-8 sm:p-12"
            style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(30,27,75,0.5))" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_70%)]" />
            <div className="relative z-10 text-center">
              <h3 className="text-2xl sm:text-3xl font-[family-name:var(--font-rajdhani)] font-bold mb-3">
                <span className="gradient-text">FORTNITE VIP</span>
              </h3>
              <p className="text-text-secondary mb-6 max-w-lg mx-auto">
                Accede a la tienda diaria, el mapa interactivo y las estadísticas de cualquier jugador en tiempo real.
              </p>
              <Link
                href="/fortnite"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Entrar al Hub VIP ⚡
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Placeholder data for widgets (will be replaced with real API calls in future phases)
const liveStreamers = [
  { name: "auronplay", game: "Fortnite", viewers: "125K" },
  { name: "ibai", game: "GTA VI", viewers: "89K" },
  { name: "rubius", game: "Valorant", viewers: "67K" },
  { name: "thegrefg", game: "Fortnite", viewers: "54K" },
];

const latestNews = [
  { title: "Fortnite Chapter 6 Season 3: Todo lo que sabemos sobre el nuevo mapa", source: "IGN", time: "hace 2h" },
  { title: "GTA VI confirma fecha de lanzamiento mundial para otoño 2026", source: "Kotaku", time: "hace 5h" },
  { title: "Riot Games anuncia el nuevo agente de Valorant con habilidades revolucionarias", source: "GameSpot", time: "hace 8h" },
  { title: "The Game Awards 2026: Lista completa de nominados revelada", source: "The Verge", time: "hace 12h" },
  { title: "Nintendo Switch 2: Análisis de rendimiento con los primeros juegos confirmados", source: "Eurogamer", time: "hace 1d" },
];
