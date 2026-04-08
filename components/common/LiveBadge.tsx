export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wider ${className}`}
      style={{
        background: "rgba(16, 185, 129, 0.15)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        color: "#10B981",
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-pulse-live absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
      </span>
      LIVE
    </span>
  );
}
