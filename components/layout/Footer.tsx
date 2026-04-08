import Link from "next/link";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Home", href: "/" },
      { label: "Games", href: "/games" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "VIP",
    links: [
      { label: "Fortnite Shop", href: "/fortnite" },
      { label: "Map", href: "/fortnite" },
      { label: "Player Stats", href: "/fortnite" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Creators", href: "/creators" },
      { label: "Sign In", href: "/auth/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-2/50 bg-surface/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="font-[family-name:var(--font-rajdhani)] text-lg font-bold tracking-wider gradient-text">
                STREAMPULSE
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tu plataforma gaming de nueva generación. Todo el ecosistema gaming en un único hub premium.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent-purple transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-surface-2/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} StreamPulse. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">
              Powered by Next.js + Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
