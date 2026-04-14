import type { Metadata } from "next";
import { getAggregatedNews } from "@/lib/news-aggregator";
import Link from "next/link";

import { NewsPortal } from "@/components/news/NewsPortal";

export const metadata: Metadata = {
  title: "News | StreamPulse",
  description: "Toda la actualidad del gaming en un solo lugar. IGN, Vandal, Eurogamer y más, actualizados al minuto.",
};

export const revalidate = 600; // Refrescar cada 10 minutos (SRS 4.3)

export default async function NewsPage() {
  const news = await getAggregatedNews(40, true); // skipIGDBMatch — not needed for news portal cards

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accent-blue to-accent-purple" />
            <h1 className="text-4xl font-black text-text-primary tracking-tight uppercase">Gaming News</h1>
          </div>
          <p className="text-text-secondary text-lg">Central de noticias: IGN, Vandal, Eurogamer y HobbyConsolas filtrados por plataforma.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2/30 border border-surface-2">
           <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">Sincronización: Activa</span>
        </div>
      </div>

      <NewsPortal initialNews={news} />
    </div>
  );
}
