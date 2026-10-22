'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'All Games' },
  { href: '/daily', label: 'Daily', accent: true },
  { href: '/passport', label: 'Passport', accent: true },
  { href: '/favorites', label: 'Favorites', icon: true },
  { href: '/contribute', label: 'Contribute' },
  { href: '/about', label: 'About' },
] as const

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function HeaderNav() {
  const pathname = usePathname() ?? '/'
  return (
    <div className="hidden md:flex items-center gap-1 lg:gap-2">
      {LINKS.map((link) => {
        const active = isActivePath(pathname, link.href)
        const tone =
          'accent' in link
            ? active
              ? 'text-amber-100 bg-amber-500/15'
              : 'text-amber-300 hover:text-amber-100'
            : active
              ? 'text-white bg-white/10'
              : 'text-white/75 hover:text-white'
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tone}`}
          >
            {'icon' in link && <Heart className="w-3.5 h-3.5 text-pink-400" />}
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
