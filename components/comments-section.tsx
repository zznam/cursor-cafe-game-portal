'use client'

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, User } from 'lucide-react'
import { getComments, submitComment } from '@/lib/api'
import { Comment } from '@/types/game'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  gameId: string
}

export function CommentsSection({ gameId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [gameId])

  async function loadComments() {
    try {
      const data = await getComments(gameId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!username.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      await submitComment(gameId, content, username)
      setContent('')
      await loadComments()
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Comments
          {comments.length > 0 && (
            <span className="text-sm font-normal text-white/40">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
          />
          <textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!username.trim() || !content.trim() || submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-purple-600 text-white font-medium text-sm transition-all hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>

        <div className="border-t border-white/10 pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-white/50 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg bg-white/3 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-purple-300" />
                        </div>
                        <p className="font-medium text-white text-sm">
                          {comment.username}
                        </p>
                      </div>
                      <p className="text-xs text-white/30">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
