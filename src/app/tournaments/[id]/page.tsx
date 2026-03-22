import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BracketTree } from '@/components/bracket/BracketTree'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-700 text-gray-300',
  REGISTRATION: 'bg-cyan-900 text-cyan-300',
  ACTIVE: 'bg-emerald-900 text-emerald-300',
  COMPLETED: 'bg-blue-900 text-blue-300',
  CANCELLED: 'bg-red-900 text-red-300',
}

const formatLabels: Record<string, string> = {
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  ROUND_ROBIN: 'Round Robin',
}

const gameTypeLabels: Record<string, string> = {
  EIGHT_BALL: '8-Ball',
  NINE_BALL: '9-Ball',
  TEN_BALL: '10-Ball',
}

export default async function PublicBracketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      org: { select: { name: true, slug: true } },
    },
  })

  if (!tournament) notFound()

  const matches = await db.match.findMany({
    where: { tournamentId: id },
    include: {
      player1: { select: { id: true, displayName: true } },
      player2: { select: { id: true, displayName: true } },
      team1: { select: { id: true, name: true } },
      team2: { select: { id: true, name: true } },
      winnerPlayer: { select: { id: true } },
      winnerTeam: { select: { id: true } },
    },
    orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
  })

  const useTeams = tournament.teamType === 'PAIRS'

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          &larr; Home
        </Link>

        {/* Tournament header */}
        <div className="mt-4">
          <p className="text-sm text-gray-400">{tournament.org.name}</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            {tournament.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[tournament.status] ?? 'bg-gray-700 text-gray-300'
              }`}
            >
              {tournament.status}
            </span>
            <span className="text-gray-400">
              {gameTypeLabels[tournament.gameType] ?? tournament.gameType}
            </span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">
              {formatLabels[tournament.format] ?? tournament.format}
            </span>
            {tournament.startDate && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bracket */}
        <div className="mt-8">
          <BracketTree
            matches={matches}
            format={tournament.format}
            useTeams={useTeams}
          />
        </div>
      </div>
    </div>
  )
}
