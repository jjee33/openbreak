import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AddPlayerForm } from './AddPlayerForm'
import { DeletePlayerButton } from './DeletePlayerButton'

export default async function PlayersPage() {
  const session = await auth()

  const membership = session?.user
    ? await db.orgMember.findFirst({
        where: { userId: session.user.id },
        select: { orgId: true },
      })
    : null

  const players = membership
    ? await db.player.findMany({
        where: { orgId: membership.orgId },
        orderBy: { displayName: 'asc' },
        select: {
          id: true,
          displayName: true,
          claimedByUserId: true,
        },
      })
    : []

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-white">Players</h1>
      <p className="mt-2 text-gray-400">Manage your venue&apos;s player roster.</p>

      <div className="mt-6">
        <AddPlayerForm />
      </div>

      {players.length === 0 ? (
        <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">No players yet. Add your first player above.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="truncate text-white">{player.displayName}</span>
                {player.claimedByUserId && (
                  <span className="shrink-0 rounded-full bg-emerald-900 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    Claimed
                  </span>
                )}
              </div>
              <DeletePlayerButton playerId={player.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
