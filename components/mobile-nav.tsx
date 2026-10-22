"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Gamepad2,
  Upload,
  Info,
  HelpCircle,
  Mail,
  Coffee,
  Compass,
  Heart,
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState(pathname);
  // Close the menu after any navigation, including browser back/forward.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          setOpenedAt(pathname);
          setOpen(!open);
        }}
        aria-expanded={open}
        className="p-2 text-white/80 hover:text-white transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-[106px] sm:top-[114px] bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[106px] sm:top-[114px] left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-50 animate-fade-in shadow-2xl max-h-[calc(100vh-114px)] overflow-y-auto">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                href="/games"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="font-medium">All Games</span>
              </Link>
              <Link
                href="/daily"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
              >
                <Coffee className="w-5 h-5 text-amber-400" />
                <span className="font-medium">Daily brew</span>
              </Link>
              <Link
                href="/passport"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
              >
                <Compass className="w-5 h-5 text-amber-400" />
                <span className="font-medium">Game passport</span>
              </Link>
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="font-medium">My favorites</span>
              </Link>
              <Link
                href="/contribute"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Contribute</span>
              </Link>
              <div className="border-t border-white/10 my-2" />
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Info className="w-5 h-5" />
                <span className="font-medium">About</span>
              </Link>
              <Link
                href="/faq"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">FAQ</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Contact</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
