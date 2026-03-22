import Link from 'next/link'
import { db } from '@/lib/db'

const gameTypeLabels: Record<string, string> = {
  EIGHT_BALL: '8-Ball',
  NINE_BALL: '9-Ball',
  TEN_BALL: '10-Ball',
}

const formatLabels: Record<string, string> = {
  SINGLE_ELIMINATION: 'Single Elim',
  DOUBLE_ELIMINATION: 'Double Elim',
  ROUND_ROBIN: 'Round Robin',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-900 text-emerald-300',
  REGISTRATION: 'bg-cyan-900 text-cyan-300',
  DRAFT: 'bg-gray-700 text-gray-300',
  COMPLETED: 'bg-blue-900 text-blue-300',
}

export default async function Home() {
  const featured = await db.tournament.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      org: { select: { name: true, city: true, state: true, slug: true } },
    },
  })

  return (
    <div className="flex flex-col bg-gray-950">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pb-16 pt-24 text-center sm:pt-32">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Open<span className="text-cyan-400">Break</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-400">
          Find and follow pool tournaments near you
        </p>

        {/* Search bar */}
        <form action="/search" method="get" className="mt-8 flex w-full max-w-md gap-2">
          <input
            name="q"
            type="text"
            placeholder="Search by city or zip code"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Find Tournaments
          </button>
        </form>
      </section>

      {/* Featured Tournaments */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Active Tournaments</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
              >
                <h3 className="truncate text-lg font-semibold text-white">{t.name}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  <Link
                    href={`/orgs/${t.org.slug}`}
                    className="hover:text-cyan-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t.org.name}
                  </Link>
                  {(t.org.city || t.org.state) && (
                    <span>
                      {' · '}
                      {[t.org.city, t.org.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                    {gameTypeLabels[t.gameType] ?? t.gameType}
                  </span>
                  <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                    {formatLabels[t.format] ?? t.format}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[t.status] ?? 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-gray-800 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Run a pool hall?</h2>
        <p className="mt-2 text-gray-400">
          Register your organization and start running tournaments for free.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-lg bg-cyan-600 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-500"
        >
          Register Your Venue
        </Link>
      </section>
    </div>
  )
}
