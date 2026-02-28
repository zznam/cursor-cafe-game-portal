import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {Gamepad2} from "lucide-react";
import {MobileNav} from "@/components/mobile-nav";
import {SearchBar} from "@/components/search-bar";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Game Portal - Play Amazing Phaser Games",
  description:
    "A vibrant portal hosting multiple Phaser games from talented developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen game-portal-bg flex flex-col">
          <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <nav className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors shrink-0"
                >
                  <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span className="text-xl sm:text-2xl font-bold">
                    Game Portal
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    href="/games"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    All Games
                  </Link>
                  <Link
                    href="/contribute"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    Contribute
                  </Link>
                </div>

                <div className="hidden md:block">
                  <SearchBar />
                </div>

                <div className="md:hidden">
                  <MobileNav />
                </div>
              </nav>

              <div className="mt-3 md:hidden">
                <SearchBar />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="bg-black/30 backdrop-blur-xl border-t border-white/10 mt-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-white/60">
                <p className="mb-2 text-white/80">
                  Game Portal &mdash; Built with Next.js, Phaser, and Supabase
                </p>
                <p className="text-sm">
                  &copy; 2026 Game Portal. All games are property of their
                  respective developers.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
