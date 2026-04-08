"use client";

import { useState } from "react";
import type { FortnitePlayerStats, FortniteStatBlock } from "@/types";

export function PlayerStats() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<FortnitePlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"solo" | "duo" | "squad">("solo");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setStats(null);

    try {
      const res = await fetch(
        `/api/fortnite/player?username=${encodeURIComponent(username.trim())}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Player not found");
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const currentStats: FortniteStatBlock | undefined =
    stats?.global_stats?.[activeTab];

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Epic Games username..."
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 text-sm transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching
            </span>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {/* Results */}
      {stats && (
        <div className="animate-slide-up">
          {/* Player header */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl glass">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-white font-bold text-lg font-[family-name:var(--font-rajdhani)]">
              {stats.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {stats.name}
              </h3>
              <p className="text-xs text-text-secondary">
                ID: {stats.account?.id?.slice(0, 12)}...
              </p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            {(["solo", "duo", "squad"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveTab(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === mode
                    ? "bg-accent-purple text-white"
                    : "bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Stats grid */}
          {currentStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Wins"
                value={currentStats.placetop1}
                accent="green"
              />
              <StatCard
                label="K/D Ratio"
                value={currentStats.kd?.toFixed(2) || "0"}
                accent="purple"
              />
              <StatCard
                label="Win Rate"
                value={`${(currentStats.winrate * 100)?.toFixed(1) || 0}%`}
                accent="blue"
              />
              <StatCard
                label="Matches"
                value={currentStats.matchesplayed}
                accent="default"
              />
              <StatCard label="Kills" value={currentStats.kills} accent="purple" />
              <StatCard
                label="Top 5"
                value={currentStats.placetop5 || currentStats.placetop3 || 0}
                accent="blue"
              />
              <StatCard
                label="Top 10"
                value={currentStats.placetop10 || currentStats.placetop6 || 0}
                accent="default"
              />
              <StatCard
                label="Score"
                value={currentStats.score?.toLocaleString() || "0"}
                accent="green"
              />
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No stats available for {activeTab} mode.
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!stats && !error && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2/50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-text-muted" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-sm text-text-muted">
            Search for any Fortnite player to view their real-time statistics.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "green" | "purple" | "blue" | "default";
}) {
  const accentColors = {
    green: "text-accent-green",
    purple: "text-accent-purple",
    blue: "text-accent-blue",
    default: "text-text-primary",
  };

  return (
    <div className="p-4 rounded-xl bg-surface/80 border border-surface-2/50 hover:border-surface-2 transition-colors">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p
        className={`text-xl font-[family-name:var(--font-rajdhani)] font-bold ${accentColors[accent]}`}
      >
        {value}
      </p>
    </div>
  );
}
