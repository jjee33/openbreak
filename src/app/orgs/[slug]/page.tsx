import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

const statusOrder: Record<string, number> = {
  ACTIVE: 0,
  REGISTRATION: 1,
  DRAFT: 2,
  COMPLETED: 3,
}

export default async function OrgProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const org = await db.organization.findUnique({
    where: { slug },
  })

  if (!org) notFound()

  const tournaments = await db.tournament.findMany({
    where: { orgId: org.id, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'desc' },
  })

  // Group by status, sorted: ACTIVE first, then REGISTRATION, DRAFT, COMPLETED
  const grouped = tournaments.reduce<Record<string, typeof tournaments>>((acc, t) => {
    if (!acc[t.status]) acc[t.status] = []
    acc[t.status].push(t)
    return acc
  }, {})

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (statusOrder[a] ?? 99) - (statusOrder[b] ?? 99)
  )

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-gray-950 px-4 py-8">
      <Link
        href="/"
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        &larr; Home
      </Link>

      {/* Org header */}
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-white">{org.name}</h1>
        {(org.city || org.state) && (
          <p className="mt-1 text-gray-400">
            {[org.city, org.state].filter(Boolean).join(', ')}
          </p>
        )}
        {org.contactEmail && (
          <p className="mt-1 text-sm text-gray-500">{org.contactEmail}</p>
        )}
      </div>

      {/* Tournaments */}
      {tournaments.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">No tournaments yet for this organization.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {sortedGroups.map(([status, group]) => (
            <section key={status}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[status] ?? 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {status}
                </span>
                <span className="text-sm text-gray-500">({group.length})</span>
              </h2>
              <div className="space-y-3">
                {group.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    className="block rounded-lg border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
                  >
                    <h3 className="truncate text-lg font-semibold text-white">{t.name}</h3>
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
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
