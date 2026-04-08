import type { Metadata } from "next";
import { getShop, getMap } from "@/lib/api/fortnite";
import { ShopGrid } from "@/components/fortnite/ShopGrid";
import { MapViewer } from "@/components/fortnite/MapViewer";
import { PlayerStats } from "@/components/fortnite/PlayerStats";

export const metadata: Metadata = {
  title: "Fortnite VIP",
  description:
    "Tu hub VIP de Fortnite: tienda diaria, mapa actual interactivo y estadísticas de jugador en tiempo real.",
};

export const dynamic = 'force-dynamic';
// export const revalidate = 3600; // Temporalmente deshabilitado para desarrollo
export default async function FortnitePage() {
  let shopItems: import("@/types").FortniteShopItem[] | undefined;
  let mapData: import("@/types").FortniteMapResponse | null | undefined;

  try {
    [shopItems, mapData] = await Promise.all([getShop(), getMap()]);
  } catch (error) {
    console.error("Fortnite page data fetch error:", error);
    shopItems = [];
    mapData = null;
  }

  const mapImageUrl = mapData?.images?.pois || mapData?.images?.blank || "";

  return (
    <div className="relative particles-bg min-h-screen">
      {/* Hero */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse-live" />
            FORTNITE VIP ACCESS
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-rajdhani)] font-bold mb-4">
            <span className="gradient-text">Fortnite</span>{" "}
            <span className="text-text-primary">Command Center</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Tienda diaria actualizada, mapa interactivo y buscador de estadísticas en tiempo real.
            Todo lo que necesitas en un solo lugar.
          </p>
        </div>
      </section>

      {/* Today&apos;s Item Shop */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-purple to-accent-blue" />
            <h2 className="text-2xl font-[family-name:var(--font-rajdhani)] font-bold text-text-primary">
              TODAY&apos;S ITEM SHOP
            </h2>
            <span className="text-xs text-text-muted ml-auto">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {shopItems && shopItems.length > 0 ? (
            <ShopGrid items={shopItems} />
          ) : (
            <div className="text-center py-16 glass rounded-2xl">
              <p className="text-text-muted text-lg">
                ⚡ Shop data is currently unavailable. Please try again later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Current Map */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-blue to-accent-green" />
            <h2 className="text-2xl font-[family-name:var(--font-rajdhani)] font-bold text-text-primary">
              CURRENT MAP
            </h2>
          </div>

          <div className="max-w-3xl mx-auto glass rounded-2xl p-4 sm:p-6">
            {mapImageUrl ? (
              <MapViewer
                imageUrl={mapImageUrl}
                pois={mapData?.pois || []}
              />
            ) : (
              <div className="text-center py-16 text-text-muted">
                Map data is currently unavailable.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Player Stats Finder */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 py-10 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-green to-accent-purple" />
            <h2 className="text-2xl font-[family-name:var(--font-rajdhani)] font-bold text-text-primary">
              PLAYER STATS FINDER
            </h2>
          </div>

          <div className="max-w-2xl mx-auto glass rounded-2xl p-4 sm:p-6">
            <PlayerStats />
          </div>
        </div>
      </section>
    </div>
  );
}
