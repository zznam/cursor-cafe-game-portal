'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import { getLeaderboard } from '@/lib/api'
import { LeaderboardEntry } from '@/types/game'
import { formatDistanceToNow } from 'date-fns'

interface LeaderboardProps {
  gameId: string
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No scores yet. Be the first!
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === 0 && <Badge className="bg-yellow-500">1st</Badge>}
                    {index === 1 && <Badge className="bg-gray-400">2nd</Badge>}
                    {index === 2 && <Badge className="bg-orange-600">3rd</Badge>}
                    {index > 2 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {entry.score.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
