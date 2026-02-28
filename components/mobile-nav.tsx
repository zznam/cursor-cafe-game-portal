'use client'

import {useState} from 'react'
import Link from 'next/link'
import {Menu, X, Home, Gamepad2, Upload} from 'lucide-react'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-white/80 hover:text-white transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-[57px] left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 z-50 animate-fade-in">
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
                href="/contribute"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Contribute</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
