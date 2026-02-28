'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Play } from 'lucide-react'
import {
  getRecentlyPlayed,
  RecentlyPlayedItem,
} from '@/lib/recently-played'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  )

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function RecentlyPlayed() {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([])

  useEffect(() => {
    setItems(getRecentlyPlayed().slice(0, 4))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-300" />
        <h2 className="text-3xl font-bold text-white">Recently Played</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/games/${item.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 group-hover:bg-purple-600/30 transition-colors">
              <Play className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{item.title}</p>
              <p className="text-white/50 text-sm">
                {timeAgo(item.playedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
