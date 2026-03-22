import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
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

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      _count: { select: { matches: true, teams: true } },
    },
  })

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-gray-400">Tournament not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/tournaments"
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        &larr; Tournaments
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[tournament.status] ?? 'bg-gray-700 text-gray-300'
              }`}
            >
              {tournament.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Game</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {gameTypeLabels[tournament.gameType] ?? tournament.gameType}
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Format</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {formatLabels[tournament.format] ?? tournament.format}
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Team Type</p>
          <p className="mt-1 text-lg font-semibold text-white">{tournament.teamType}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm text-gray-400">Matches</p>
          <p className="mt-1 text-lg font-semibold text-white">{tournament._count.matches}</p>
        </div>
      </div>

      {tournament.startDate && (
        <p className="mt-4 text-sm text-gray-400">
          Start date: {new Date(tournament.startDate).toLocaleDateString()}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href={`/dashboard/tournaments/${tournament.id}/bracket`}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
        >
          Manage Bracket
        </Link>
        <Link
          href={`/tournaments/${tournament.id}`}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
        >
          View Public Page
        </Link>
      </div>
    </div>
  )
}
