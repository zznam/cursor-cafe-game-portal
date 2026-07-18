import type {Metadata} from "next";
import {Outfit} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {Gamepad2, Coffee, Github, Twitter, Heart} from "lucide-react";
import {MobileNav} from "@/components/mobile-nav";
import {SearchBar} from "@/components/search-bar";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cursor Café — Play Amazing Browser Games",
  description:
    "Discover and play 27+ amazing browser games built with Phaser. Leaderboards, ratings, and community — all in one place.",
  keywords: [
    "browser games",
    "phaser games",
    "online games",
    "arcade games",
    "puzzle games",
    "free games",
  ],
  openGraph: {
    title: "Cursor Café — Play Amazing Browser Games",
    description:
      "Discover and play 27+ amazing browser games. Leaderboards, ratings, and community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={outfit.className}>
        <div className="min-h-screen game-portal-bg flex flex-col">
          <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 sm:py-4">
              <nav className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors shrink-0 group"
                >
                  <div className="relative">
                    <Coffee className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute -bottom-0.5 -right-1 text-purple-400" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-amber-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Cursor Café
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
                  <Link
                    href="/about"
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    About
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

          <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 mt-auto">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-1">
                  <Link href="/" className="flex items-center gap-2 mb-3 group">
                    <Coffee className="w-6 h-6 text-amber-400" />
                    <span className="text-lg font-bold bg-linear-to-r from-amber-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Cursor Café
                    </span>
                  </Link>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Your cozy corner for amazing browser games. Play, compete,
                    and have fun.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                    Explore
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/games"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        All Games
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contribute"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        Contribute
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                    Support
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/faq"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <a
                        href="https://github.com/zznam/cursor-cafe-game-portal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                    Connect
                  </h4>
                  <div className="flex gap-3">
                    <a
                      href="https://github.com/zznam/cursor-cafe-game-portal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-white/40">
                  &copy; 2026 Cursor Café. Built with Next.js, Phaser &amp;
                  Supabase.
                </p>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  Made with{" "}
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by the
                  Cursor Café team
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
