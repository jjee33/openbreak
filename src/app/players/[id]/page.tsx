import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const player = await db.player.findUnique({
    where: { id },
    include: {
      org: { select: { name: true, slug: true } },
    },
  })

  if (!player) notFound()

  // Get all matches this player participated in
  const matches = await db.match.findMany({
    where: {
      OR: [{ player1Id: id }, { player2Id: id }],
    },
    include: {
      tournament: { select: { id: true, name: true, format: true, gameType: true, status: true } },
      player1: { select: { id: true, displayName: true } },
      player2: { select: { id: true, displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate win/loss
  const completedMatches = matches.filter((m) => m.completedAt)
  const wins = completedMatches.filter((m) => m.winnerId === id).length
  const losses = completedMatches.length - wins

  // Tournament history: group matches by tournament
  const tournamentMap = new Map<
    string,
    {
      id: string
      name: string
      format: string
      gameType: string
      status: string
      wins: number
      losses: number
      totalMatches: number
      maxRound: number
    }
  >()

  for (const match of matches) {
    const t = match.tournament
    if (!tournamentMap.has(t.id)) {
      tournamentMap.set(t.id, {
        id: t.id,
        name: t.name,
        format: t.format,
        gameType: t.gameType,
        status: t.status,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        maxRound: 0,
      })
    }
    const entry = tournamentMap.get(t.id)!
    entry.totalMatches++
    if (match.completedAt) {
      if (match.winnerId === id) {
        entry.wins++
      } else {
        entry.losses++
      }
    }
    if (match.round > entry.maxRound) {
      entry.maxRound = match.round
    }
  }

  const tournamentHistory = Array.from(tournamentMap.values())

  const gameTypeLabels: Record<string, string> = {
    EIGHT_BALL: '8-Ball',
    NINE_BALL: '9-Ball',
    TEN_BALL: '10-Ball',
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-900 text-emerald-300',
    COMPLETED: 'bg-blue-900 text-blue-300',
    REGISTRATION: 'bg-cyan-900 text-cyan-300',
    DRAFT: 'bg-gray-700 text-gray-300',
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-gray-950 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        &larr; Home
      </Link>

      {/* Player header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-white">{player.displayName}</h1>
        <p className="mt-1 text-sm text-gray-400">
          <Link href={`/orgs/${player.org.slug}`} className="hover:text-cyan-400">
            {player.org.name}
          </Link>
        </p>
        {player.claimedByUserId && (
          <span className="mt-2 inline-block rounded-full bg-emerald-900 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            Verified Player
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
          <p className="text-2xl font-bold text-white">{completedMatches.length}</p>
          <p className="text-sm text-gray-400">Matches</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{wins}</p>
          <p className="text-sm text-gray-400">Wins</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{losses}</p>
          <p className="text-sm text-gray-400">Losses</p>
        </div>
      </div>

      {/* Tournament history */}
      <h2 className="mt-8 text-xl font-semibold text-white">Tournament History</h2>

      {tournamentHistory.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900 p-6 text-center">
          <p className="text-gray-400">No tournament history yet.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {tournamentHistory.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">{t.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <span>{gameTypeLabels[t.gameType] ?? t.gameType}</span>
                    <span className="text-gray-600">·</span>
                    <span>
                      {t.wins}W - {t.losses}L
                    </span>
                    <span className="text-gray-600">·</span>
                    <span>Round {t.maxRound}</span>
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

      {/* Unclaimed player message */}
      {!player.claimedByUserId && (
        <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900 p-6 text-center">
          <p className="text-gray-400">
            This player hasn&apos;t created an account yet.
          </p>
          <Link
            href="/register"
            className="mt-3 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Claim This Profile
          </Link>
        </div>
      )}
    </div>
  )
}
