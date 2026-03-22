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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const tournaments = query
    ? await db.tournament.findMany({
        where: {
          status: { not: 'CANCELLED' },
          org: {
            OR: [
              { city: { contains: query, mode: 'insensitive' } },
              { zip: query },
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          org: { select: { name: true, city: true, state: true, slug: true } },
        },
      })
    : []

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-gray-950 px-4 py-8">
      <h1 className="text-3xl font-bold text-white">Search Tournaments</h1>

      {/* Search form */}
      <form action="/search" method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="City name or zip code"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-cyan-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-cyan-500"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {query && (
        <p className="mt-4 text-sm text-gray-400">
          {tournaments.length} result{tournaments.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && tournaments.length === 0 ? (
        <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">No tournaments found. Try a different city or zip code.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">{t.name}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {t.org.name}
                    {(t.org.city || t.org.state) && (
                      <span>
                        {' · '}
                        {[t.org.city, t.org.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <span>{gameTypeLabels[t.gameType] ?? t.gameType}</span>
                    <span className="text-gray-600">·</span>
                    <span>{formatLabels[t.format] ?? t.format}</span>
                    {t.startDate && (
                      <>
                        <span className="text-gray-600">·</span>
                        <span>{new Date(t.startDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[t.status] ?? 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
