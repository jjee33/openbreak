import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-700 text-gray-300',
  REGISTRATION: 'bg-cyan-900 text-cyan-300',
  ACTIVE: 'bg-emerald-900 text-emerald-300',
  COMPLETED: 'bg-blue-900 text-blue-300',
  CANCELLED: 'bg-red-900 text-red-300',
}

const formatLabels: Record<string, string> = {
  SINGLE_ELIMINATION: 'Single Elim',
  DOUBLE_ELIMINATION: 'Double Elim',
  ROUND_ROBIN: 'Round Robin',
}

const gameTypeLabels: Record<string, string> = {
  EIGHT_BALL: '8-Ball',
  NINE_BALL: '9-Ball',
  TEN_BALL: '10-Ball',
}

export default async function TournamentsPage() {
  const session = await auth()

  const membership = session?.user
    ? await db.orgMember.findFirst({
        where: { userId: session.user.id },
        select: { orgId: true },
      })
    : null

  const tournaments = membership
    ? await db.tournament.findMany({
        where: { orgId: membership.orgId },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tournaments</h1>
        <Link
          href="/dashboard/tournaments/new"
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
        >
          New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">No tournaments yet. Create your first one.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/tournaments/${t.id}`}
              className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">
                    {t.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400">
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
