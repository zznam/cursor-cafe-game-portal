'use client'
import { useState } from 'react'
export function ShareResult({
  text,
  label = 'Share result',
}: {
  text: string
  label?: string
}) {
  const [manual, setManual] = useState(false),
    [copied, setCopied] = useState(false)
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text })
        return
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setManual(true)
    }
  }
  return (
    <div>
      <button className="cafe-control" onClick={() => void share()}>
        {copied ? 'Copied!' : label}
      </button>
      {manual && (
        <label className="block mt-2 text-sm">
          Copy this text to share
          <textarea
            readOnly
            value={text}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full bg-white text-stone-900 p-3 rounded"
          />
        </label>
      )}
    </div>
  )
}
