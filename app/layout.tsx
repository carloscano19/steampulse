import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: {
    default: "StreamPulse — Gaming & Creator Hub",
    template: "%s | StreamPulse",
  },
  description:
    "Tu plataforma gaming de nueva generación. Catálogo de videojuegos, tienda diaria de Fortnite, streams en directo y noticias. Todo en un único hub premium.",
  keywords: [
    "gaming",
    "fortnite",
    "twitch",
    "esports",
    "videojuegos",
    "streamers",
    "noticias gaming",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "StreamPulse",
    title: "StreamPulse — Gaming & Creator Hub",
    description:
      "Tu plataforma gaming de nueva generación. Catálogo, Fortnite VIP, streams en directo y noticias.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamPulse — Gaming & Creator Hub",
    description:
      "Tu plataforma gaming de nueva generación. Catálogo, Fortnite VIP, streams en directo y noticias.",
  },
};

import { NewsTicker } from "@/components/layout/NewsTicker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${rajdhani.variable} antialiased`}
    >
      <body className="flex flex-col bg-background text-text-primary overflow-x-hidden w-full relative min-h-screen">
        {/* Global Dynamic Background Orbs (MOVED TO Z-0 FOR VISIBILITY) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-5%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-purple/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[30%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/15 blur-[110px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute bottom-[-10%] left-[10%] w-[70vw] h-[70vw] rounded-full bg-accent-blue/15 blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="sticky top-0 z-[100] flex flex-col shadow-2xl">
          <Navbar />
          <NewsTicker />
        </div>

        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
