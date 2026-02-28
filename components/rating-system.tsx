'use client'

import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { submitRating } from '@/lib/api'

interface RatingSystemProps {
  gameId: string
  currentRating?: number
  onRatingSubmit?: () => void
}

export function RatingSystem({ gameId, currentRating = 0, onRatingSubmit }: RatingSystemProps) {
  const [rating, setRating] = useState(currentRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setSubmitting(true)
    try {
      await submitRating(gameId, rating, review || undefined)
      setSubmitted(true)
      onRatingSubmit?.()
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Rate this game</h3>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-all duration-150 ${
                  value <= displayRating
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]'
                    : 'text-white/20 hover:text-white/40'
                }`}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-3 text-sm text-white/60">
              {displayRating === 1
                ? 'Poor'
                : displayRating === 2
                  ? 'Fair'
                  : displayRating === 3
                    ? 'Good'
                    : displayRating === 4
                      ? 'Great'
                      : 'Amazing'}
            </span>
          )}
        </div>

        <textarea
          placeholder="Write a review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full py-2.5 px-4 rounded-lg bg-purple-600 text-white font-medium text-sm transition-all hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>

        {submitted && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-sm text-green-300">
              Thanks! Your rating has been submitted.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
