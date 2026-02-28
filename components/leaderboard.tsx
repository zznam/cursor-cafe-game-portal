'use client'

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Medal } from 'lucide-react'
import { getLeaderboard } from '@/lib/api'
import { LeaderboardEntry } from '@/types/game'
import { formatDistanceToNow } from 'date-fns'

interface LeaderboardProps {
  gameId: string
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
        <Medal className="w-4 h-4 text-yellow-400" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400/20 border border-gray-400/40 flex items-center justify-center">
        <Medal className="w-4 h-4 text-gray-300" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-orange-600/20 border border-orange-600/40 flex items-center justify-center">
        <Medal className="w-4 h-4 text-orange-400" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
      <span className="text-xs font-medium text-white/50">{rank}</span>
    </div>
  )
}

export function Leaderboard({ gameId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard(gameId, 10)
        setEntries(data)
      } catch (error) {
        console.error('Failed to load leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [gameId])

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </h3>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-8">
            No scores yet. Be the first!
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5 ${
                    index < 3 ? 'bg-white/3' : ''
                  }`}
                >
                  <RankBadge rank={index + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {entry.username}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                          ? 'text-gray-300'
                          : index === 2
                            ? 'text-orange-400'
                            : 'text-white'
                    }`}>
                      {entry.score.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
