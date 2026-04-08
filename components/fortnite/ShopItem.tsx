"use client";

import Image from "next/image";
import type { FortniteShopItem } from "@/types";

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: "rgba(107, 114, 128, 0.15)", border: "rgba(107, 114, 128, 0.4)", text: "#6B7280" },
  uncommon: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)", text: "#22C55E" },
  rare: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#3B82F6" },
  epic: { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.4)", text: "#A855F7" },
  legendary: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#F59E0B" },
  mythic: { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.4)", text: "#F97316" },
};

function getRarityStyle(rarity: string) {
  return rarityColors[rarity.toLowerCase()] || rarityColors.common;
}

export function ShopItem({ item }: { item: FortniteShopItem }) {
  if (!item) return null;
  
  const rarity = typeof item.rarity === "string" ? item.rarity : "Common";
  const rarityStyle = getRarityStyle(rarity);
  const type = typeof item.type === "string" ? item.type : "Unknown";
  const name = typeof item.name === "string" ? item.name : "Unknown Item";
  const price = typeof item.price === "number" ? item.price : 0;
  const imageUrl = typeof item.image === "string" ? item.image : "";

  return (
    <div
      className="group relative rounded-xl overflow-hidden card-hover cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${rarityStyle.bg}, rgba(30, 41, 59, 0.8))`,
        border: `1px solid ${rarityStyle.border}`,
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="w-full h-full bg-surface-2/50 flex items-center justify-center">
            <span className="text-text-muted text-sm">No Image</span>
          </div>
        )}

        {/* Rarity badge */}
        <div className="absolute top-2 left-2">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider"
            style={{
              background: rarityStyle.bg,
              border: `1px solid ${rarityStyle.border}`,
              color: rarityStyle.text,
            }}
          >
            {rarity}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-text-secondary">{type}</span>
          <span className="flex items-center gap-1 text-xs font-[family-name:var(--font-rajdhani)] font-bold text-accent-blue">
            <VBucksIcon />
            {price.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </div>
  );
}

function VBucksIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v12M8 10l4-4 4 4M8 14l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
