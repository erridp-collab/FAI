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
  title: "FAI Microimpresa | Diagnosi",
  description: "Quanto è solida la tua attività? Scoprilo con la nostra diagnosi.",
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
        <header className="w-full p-6 flex items-center justify-between z-10 relative">
          <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-foreground shadow-sm">
              <span className="font-bold text-sm">F</span>
            </div>
            FAI Microimpresa
          </div>
        </header>

        <main className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </main>

        <footer className="w-full p-6 text-center text-sm text-muted-foreground z-10 relative">
          <p>© {new Date().getFullYear()} FAI Microimpresa. Tutti i diritti riservati.</p>
        </footer>
      </body>
    </html>
  );
}
