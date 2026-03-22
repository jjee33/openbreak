import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { StartTournamentButton } from './StartTournamentButton'
import { MatchCard } from './MatchCard'
import Link from 'next/link'

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

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: { org: { select: { name: true } } },
  })

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-gray-400">Tournament not found.</p>
      </div>
    )
  }

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
  const canStart = tournament.status === 'DRAFT' || tournament.status === 'REGISTRATION'

  // Group matches by bracket section then round
  const winnerMatches = matches.filter(
    (m) => m.bracketSlot?.startsWith('W-') || !m.bracketSlot?.startsWith('L-') && !m.bracketSlot?.startsWith('GF-')
  )
  const loserMatches = matches.filter((m) => m.bracketSlot?.startsWith('L-'))
  const gfMatches = matches.filter((m) => m.bracketSlot?.startsWith('GF-'))

  function groupByRound(matchList: typeof matches) {
    const groups: Record<number, typeof matches> = {}
    for (const m of matchList) {
      if (!groups[m.round]) groups[m.round] = []
      groups[m.round].push(m)
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([round, roundMatches]) => ({
        round: Number(round),
        matches: roundMatches,
      }))
  }

  const winnerRounds = groupByRound(winnerMatches)
  const loserRounds = groupByRound(loserMatches)
  const gfRounds = groupByRound(gfMatches)

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/tournaments"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            &larr; Tournaments
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-white">{tournament.name}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {gameTypeLabels[tournament.gameType] ?? tournament.gameType}
            {' · '}
            {formatLabels[tournament.format] ?? tournament.format}
            {' · '}
            <span className="text-cyan-400">{tournament.status}</span>
          </p>
        </div>

        {canStart && (
          <StartTournamentButton tournamentId={tournament.id} />
        )}

        <Link
          href={`/tournaments/${tournament.id}`}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          View public bracket &rarr;
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">
            {canStart
              ? 'Click "Start Tournament" to generate the bracket.'
              : 'No matches found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Winner Bracket */}
          {winnerRounds.length > 0 && (
            <section>
              {tournament.format === 'DOUBLE_ELIMINATION' && (
                <h2 className="mb-4 text-lg font-semibold text-white">Winner Bracket</h2>
              )}
              <div className="flex gap-6 overflow-x-auto pb-4">
                {winnerRounds.map(({ round, matches: roundMatches }) => (
                  <div key={`W-${round}`} className="flex shrink-0 flex-col gap-3">
                    <h3 className="text-center text-sm font-medium text-gray-400">
                      {tournament.format === 'ROUND_ROBIN' ? `Round ${round}` : `Round ${round}`}
                    </h3>
                    {roundMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        useTeams={useTeams}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Loser Bracket */}
          {loserRounds.length > 0 && (
            <section>
              <div className="border-t border-gray-800 pt-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Loser Bracket</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {loserRounds.map(({ round, matches: roundMatches }) => (
                    <div key={`L-${round}`} className="flex shrink-0 flex-col gap-3">
                      <h3 className="text-center text-sm font-medium text-gray-400">
                        Round {round}
                      </h3>
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          useTeams={useTeams}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Grand Finals */}
          {gfRounds.length > 0 && (
            <section>
              <div className="border-t border-gray-800 pt-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Grand Finals</h2>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {gfRounds.map(({ round, matches: roundMatches }) => (
                    <div key={`GF-${round}`} className="flex shrink-0 flex-col gap-3">
                      <h3 className="text-center text-sm font-medium text-gray-400">
                        Match {round}
                      </h3>
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          useTeams={useTeams}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
