"use client";

import { useState } from "react";
import { ShopItem } from "./ShopItem";
import type { FortniteShopItem } from "@/types";

const ITEMS_PER_PAGE = 24;

const typeFilters = ["All", "Traje", "Accesorio mochilero", "Pico", "Ala delta", "Gesto", "Envoltorio", "Jam Track"];

export function ShopGrid({ items }: { items: FortniteShopItem[] }) {
  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredItems =
    filter === "All"
      ? items
      : items.filter(
          (item) => item.type && typeof item.type === "string" && item.type.toLowerCase().includes(filter.toLowerCase())
        );

  const visible = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {typeFilters.map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilter(type);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === type
                ? "bg-accent-purple text-white"
                : "bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            }`}
          >
            {type}
          </button>
        ))}
        <span className="ml-auto text-xs text-text-muted self-center">
          {filteredItems.length} items
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {visible.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="animate-slide-up opacity-0"
            style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s`, animationFillMode: "forwards" }}
          >
            <ShopItem item={item} />
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="px-8 py-3 rounded-full bg-surface neon-border text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cargar más ({filteredItems.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No se encontraron ítems con el filtro seleccionado.
        </div>
      )}
    </div>
  );
}
