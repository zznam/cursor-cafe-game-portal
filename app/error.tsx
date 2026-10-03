'use client'
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-lg px-6 py-24 text-center" role="alert">
      <h1 className="text-3xl font-bold text-white">
        The café is taking a quick break
      </h1>
      <p className="mt-4 text-white/70">
        We couldn’t load the games. Please try again in a moment.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-500"
      >
        Try again
      </button>
    </section>
  )
}
