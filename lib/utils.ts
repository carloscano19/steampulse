import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return formatDate(dateString);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: "var(--color-rarity-common)",
    uncommon: "var(--color-rarity-uncommon)",
    rare: "var(--color-rarity-rare)",
    epic: "var(--color-rarity-epic)",
    legendary: "var(--color-rarity-legendary)",
    mythic: "var(--color-rarity-mythic)",
  };
  return map[rarity.toLowerCase()] || map.common;
}

export function getRarityClass(rarity: string): string {
  const map: Record<string, string> = {
    common: "bg-rarity-common",
    uncommon: "bg-rarity-uncommon",
    rare: "bg-rarity-rare",
    epic: "bg-rarity-epic",
    legendary: "bg-rarity-legendary",
    mythic: "bg-rarity-mythic",
  };
  return map[rarity.toLowerCase()] || map.common;
}
