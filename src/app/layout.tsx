import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fai-microimpresa.it"),
  title: {
    default: "Diagnosi di solidità | Gratuita",
    template: "%s | Diagnosi di solidità",
  },
  description:
    "Quanto è solida la tua attività? 40 domande, 7 aree chiave, risultati immediati. Diagnosi costruita per piccole imprese e attività ricettive.",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Diagnosi di solidità",
    title: "Diagnosi di solidità | Gratuita",
    description: "Quanto è solida la tua attività? Scoprilo con la Diagnosi di solidità.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Diagnosi di solidità" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnosi di solidità | Gratuita",
    description: "Quanto è solida la tua attività?",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-primary/20 selection:text-primary">
        <header className="w-full px-6 py-4 flex items-center z-10 relative border-b border-raised">
          <div className="font-bold text-lg tracking-tight text-primary flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-primary shadow-sm">
              <span className="font-bold text-xs">D</span>
            </div>
            Diagnosi di solidità
          </div>
        </header>

        <main className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </main>

        <footer className="w-full p-6 text-center text-sm text-tertiary z-10 relative border-t border-raised">
          <p>© Alvaland srl 2026 tutti i diritti riservati</p>
        </footer>
      </body>
    </html>
  );
}
