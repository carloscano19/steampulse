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
        {/* Global Dynamic Background Orbs */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-purple/10 blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-accent-blue/10 blur-[150px]" />
        </div>

        <Navbar />
        <NewsTicker />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
