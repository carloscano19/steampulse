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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
