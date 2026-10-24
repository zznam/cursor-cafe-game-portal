import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, MessageSquare, HelpCircle } from 'lucide-react'
import { Github } from '@/components/brand-icons'

const ISSUES_URL = 'https://github.com/zznam/cursor-cafe-game-portal/issues'

export const metadata: Metadata = {
  title: 'Contact — Cursor Café',
  description: 'Report a game problem, suggest an improvement, or find help at Cursor Café.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/70 font-medium">Get in touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent">Contact Us</h1>
          <p className="text-lg text-white/70 max-w-lg mx-auto">Found a game problem or have an idea? Share it with the project on GitHub.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Find help</h2>
            <Link href="/faq" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
              <HelpCircle className="w-6 h-6 text-amber-300 shrink-0" />
              <div><p className="font-medium text-white">Frequently asked questions</p><p className="text-sm text-white/70">Controls, progress, and scores</p></div>
            </Link>
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
              <Github className="w-6 h-6 text-purple-300 shrink-0" />
              <div><p className="font-medium text-white">Project issues</p><p className="text-sm text-white/70">Browse reports and suggestions</p></div>
            </a>
          </div>
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Prepare a report</h2>
            <p id="contact-help" className="text-sm text-white/70 mb-6">You will review your draft on GitHub before posting. A GitHub account is required. Issues are public, so leave out passwords and private information.</p>
            <form action={`${ISSUES_URL}/new`} method="get" target="_blank" rel="noopener noreferrer" aria-describedby="contact-help" className="space-y-5">
              <div>
                <label htmlFor="contact-title" className="block text-sm font-medium text-white/80 mb-2">Title</label>
                <input id="contact-title" name="title" required maxLength={120} placeholder="A short description of the problem or idea" className="discovery-field" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-white/80 mb-2">Details</label>
                <textarea id="contact-message" name="body" required maxLength={4000} rows={7} placeholder="For a bug, include the game, your device and browser, what you did, and what happened." className="discovery-field resize-y" />
              </div>
              <button type="submit" className="cafe-control primary w-full gap-2">Review on GitHub <ArrowUpRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
