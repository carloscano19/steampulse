export function Skeleton({
  className = "",
  variant = "rectangular",
}: {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
}) {
  const baseClass =
    "animate-shimmer bg-surface-2/50 rounded-lg";
  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
        ? "rounded h-4 w-3/4"
        : "";

  return <div className={`${baseClass} ${variantClass} ${className}`} />;
}
