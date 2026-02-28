import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Portal - Play Amazing Phaser Games",
  description: "A vibrant portal hosting multiple Phaser games from talented developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen game-portal-bg">
          <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors">
                  <Gamepad2 className="w-8 h-8" />
                  <span className="text-2xl font-bold">Game Portal</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-white hover:text-purple-200 transition-colors">
                    Home
                  </Link>
                  <Link href="/games" className="text-white hover:text-purple-200 transition-colors">
                    All Games
                  </Link>
                  <Link href="/contribute" className="text-white hover:text-purple-200 transition-colors">
                    Contribute
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-20">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-white/80">
                <p className="mb-2">Game Portal - Built with Next.js, Phaser, and Supabase</p>
                <p className="text-sm">© 2026 Game Portal. All games are property of their respective developers.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
