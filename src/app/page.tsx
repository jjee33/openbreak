import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Open<span className="text-cyan-400">Break</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Pool tournament management for your venue. 8-ball, 9-ball, 10-ball —
          brackets, scores, and standings made simple.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-cyan-600 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Register Your Venue
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-700 px-6 py-3 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
