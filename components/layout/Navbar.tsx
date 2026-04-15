"use client";

import Link from "next/link";
import { useState } from "react";

type NavItem = {
  href?: string;
  label: string;
  subItems?: { href: string; label: string }[];
};

const navLinks: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/spotlight", label: "Juego del Mes ⚡" },
  { 
    label: "Destacados ⭐", 
    subItems: [
      { href: "/fortnite", label: "Fortnite VIP" },
      { href: "/fc", label: "EA FC VIP" }
    ] 
  },
  { href: "/games", label: "Games" },
  { href: "/creators", label: "Creators" },
  { href: "/news", label: "News" },
  { href: "/wiki", label: "Wiki 📘" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-2/50">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-rajdhani)] text-xl font-bold tracking-wider gradient-text group-hover:opacity-80 transition-opacity">
            STREAMPULSE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 relative z-50">
          {navLinks.map((link) => {
            if (link.subItems) {
              return (
                <div key={link.label} className="relative group">
                  <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface/60 flex items-center gap-1.5 focus:outline-none">
                    {link.label}
                    <svg className="w-3.5 h-3.5 text-text-muted transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {/* Dropdown Box */}
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 transform translate-y-3 group-hover:translate-y-0">
                    <div className="glass rounded-xl border border-surface-2/50 shadow-2xl p-2 flex flex-col gap-1 backdrop-blur-3xl bg-background/80">
                      {link.subItems.map(sub => (
                        <Link 
                          key={sub.href} 
                          href={sub.href}
                          className="px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-white hover:bg-surface-2 rounded-lg transition-colors flex items-center group/sub"
                        >
                          {sub.label}
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href!}
                className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface/60"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-text-primary transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-surface-2/50 animate-slide-up">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              if (link.subItems) {
                return (
                  <div key={link.label} className="flex flex-col mb-1 border-b border-surface-2/30 pb-2">
                    <div className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                      {link.label}
                    </div>
                    {link.subItems.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="pl-8 pr-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent-blue" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface/60 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
            
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="mt-4 px-4 py-3 text-sm font-semibold text-center rounded-full bg-gradient-to-r from-accent-purple to-accent-blue text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
