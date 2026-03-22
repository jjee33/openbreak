'use client'

import { useEffect, useState } from 'react'

interface MatchParticipant {
  id: string
  displayName?: string
  name?: string
}

export interface BracketMatch {
  id: string
  round: number
  matchNumber: number
  bracketSlot: string | null
  score1: number | null
  score2: number | null
  completedAt: Date | string | null
  player1: MatchParticipant | null
  player2: MatchParticipant | null
  team1: MatchParticipant | null
  team2: MatchParticipant | null
  winnerPlayer: { id: string } | null
  winnerTeam: { id: string } | null
}

interface BracketTreeProps {
  matches: BracketMatch[]
  format: string
  useTeams: boolean
}

interface RoundGroup {
  round: number
  matches: BracketMatch[]
}

function getName(p: MatchParticipant | null): string {
  if (!p) return 'BYE'
  return p.displayName ?? p.name ?? 'TBD'
}

function groupByRound(matchList: BracketMatch[]): RoundGroup[] {
  const groups: Record<number, BracketMatch[]> = {}
  for (const m of matchList) {
    if (!groups[m.round]) groups[m.round] = []
    groups[m.round].push(m)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([round, matches]) => ({ round: Number(round), matches }))
}

function MatchNode({
  match,
  useTeams,
  x,
  y,
}: {
  match: BracketMatch
  useTeams: boolean
  x: number
  y: number
}) {
  const p1 = useTeams ? match.team1 : match.player1
  const p2 = useTeams ? match.team2 : match.player2
  const winnerId = useTeams ? match.winnerTeam?.id : match.winnerPlayer?.id

  const nodeWidth = 180
  const nodeHeight = 56

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        rx={6}
        fill="#111827"
        stroke="#1f2937"
        strokeWidth={1}
      />
      {/* Participant 1 */}
      <text
        x={x + 8}
        y={y + 20}
        fill={winnerId && p1 && winnerId === p1.id ? '#22d3ee' : '#e5e7eb'}
        fontSize={12}
        fontWeight={winnerId && p1 && winnerId === p1.id ? 'bold' : 'normal'}
      >
        {getName(p1).slice(0, 18)}
      </text>
      {match.score1 != null && (
        <text x={x + nodeWidth - 24} y={y + 20} fill="#9ca3af" fontSize={12} textAnchor="end">
          {match.score1}
        </text>
      )}
      {/* Divider */}
      <line x1={x} y1={y + 28} x2={x + nodeWidth} y2={y + 28} stroke="#1f2937" strokeWidth={1} />
      {/* Participant 2 */}
      <text
        x={x + 8}
        y={y + 46}
        fill={winnerId && p2 && winnerId === p2.id ? '#22d3ee' : '#e5e7eb'}
        fontSize={12}
        fontWeight={winnerId && p2 && winnerId === p2.id ? 'bold' : 'normal'}
      >
        {getName(p2).slice(0, 18)}
      </text>
      {match.score2 != null && (
        <text x={x + nodeWidth - 24} y={y + 46} fill="#9ca3af" fontSize={12} textAnchor="end">
          {match.score2}
        </text>
      )}
    </g>
  )
}

function BracketSVG({
  rounds,
  useTeams,
}: {
  rounds: RoundGroup[]
  useTeams: boolean
}) {
  const nodeWidth = 180
  const nodeHeight = 56
  const colGap = 60
  const rowGap = 16

  const maxMatchesInRound = Math.max(...rounds.map((r) => r.matches.length), 1)
  const svgWidth = rounds.length * (nodeWidth + colGap) + 40
  const svgHeight = maxMatchesInRound * (nodeHeight + rowGap) + 40

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="block"
    >
      {rounds.map((round, ri) => {
        const x = 20 + ri * (nodeWidth + colGap)
        const matchCount = round.matches.length
        const totalHeight = matchCount * nodeHeight + (matchCount - 1) * rowGap
        const yOffset = (svgHeight - totalHeight) / 2

        return round.matches.map((match, mi) => {
          const y = yOffset + mi * (nodeHeight + rowGap)

          // Draw connector lines to next round
          let connector = null
          if (ri < rounds.length - 1) {
            const nextRound = rounds[ri + 1]
            const nextMatchCount = nextRound.matches.length
            const nextTotalHeight =
              nextMatchCount * nodeHeight + (nextMatchCount - 1) * rowGap
            const nextYOffset = (svgHeight - nextTotalHeight) / 2
            const nextMi = Math.floor(mi / 2)
            if (nextMi < nextMatchCount) {
              const nextY =
                nextYOffset + nextMi * (nodeHeight + rowGap) + nodeHeight / 2
              const fromX = x + nodeWidth
              const fromY = y + nodeHeight / 2
              const toX = 20 + (ri + 1) * (nodeWidth + colGap)
              const midX = (fromX + toX) / 2

              connector = (
                <path
                  d={`M ${fromX} ${fromY} H ${midX} V ${nextY} H ${toX}`}
                  fill="none"
                  stroke="#374151"
                  strokeWidth={1.5}
                />
              )
            }
          }

          return (
            <g key={match.id}>
              {connector}
              <MatchNode match={match} useTeams={useTeams} x={x} y={y} />
            </g>
          )
        })
      })}
    </svg>
  )
}

function MatchCardPublic({
  match,
  useTeams,
}: {
  match: BracketMatch
  useTeams: boolean
}) {
  const p1 = useTeams ? match.team1 : match.player1
  const p2 = useTeams ? match.team2 : match.player2
  const winnerId = useTeams ? match.winnerTeam?.id : match.winnerPlayer?.id

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
      <div className="mb-1 text-xs text-gray-500">
        {match.bracketSlot ?? `M${match.matchNumber}`}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            winnerId && p1 && winnerId === p1.id
              ? 'font-semibold text-cyan-400'
              : 'text-white'
          }`}
        >
          {getName(p1)}
        </span>
        <span className="text-sm text-gray-400">{match.score1 ?? '-'}</span>
      </div>
      <div className="my-1 border-t border-gray-800" />
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            winnerId && p2 && winnerId === p2.id
              ? 'font-semibold text-cyan-400'
              : 'text-white'
          }`}
        >
          {getName(p2)}
        </span>
        <span className="text-sm text-gray-400">{match.score2 ?? '-'}</span>
      </div>
    </div>
  )
}

function RoundRobinTable({
  matches,
  useTeams,
}: {
  matches: BracketMatch[]
  useTeams: boolean
}) {
  // Build standings from completed matches
  const standings: Record<string, { name: string; wins: number; losses: number; pointsFor: number; pointsAgainst: number }> = {}

  for (const match of matches) {
    const p1 = useTeams ? match.team1 : match.player1
    const p2 = useTeams ? match.team2 : match.player2
    const winnerId = useTeams ? match.winnerTeam?.id : match.winnerPlayer?.id

    if (p1 && !standings[p1.id]) {
      standings[p1.id] = { name: getName(p1), wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 }
    }
    if (p2 && !standings[p2.id]) {
      standings[p2.id] = { name: getName(p2), wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 }
    }

    if (match.completedAt && p1 && p2) {
      standings[p1.id].pointsFor += match.score1 ?? 0
      standings[p1.id].pointsAgainst += match.score2 ?? 0
      standings[p2.id].pointsFor += match.score2 ?? 0
      standings[p2.id].pointsAgainst += match.score1 ?? 0

      if (winnerId === p1.id) {
        standings[p1.id].wins++
        standings[p2.id].losses++
      } else if (winnerId === p2.id) {
        standings[p2.id].wins++
        standings[p1.id].losses++
      }
    }
  }

  const sorted = Object.values(standings).sort((a, b) => b.wins - a.wins || a.losses - b.losses)

  return (
    <div className="space-y-6">
      {/* Standings table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2 text-center">W</th>
              <th className="px-4 py-2 text-center">L</th>
              <th className="px-4 py-2 text-center">PF</th>
              <th className="px-4 py-2 text-center">PA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => (
              <tr key={entry.name} className="border-b border-gray-800/50">
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2 text-white">{entry.name}</td>
                <td className="px-4 py-2 text-center text-emerald-400">{entry.wins}</td>
                <td className="px-4 py-2 text-center text-red-400">{entry.losses}</td>
                <td className="px-4 py-2 text-center text-gray-300">{entry.pointsFor}</td>
                <td className="px-4 py-2 text-center text-gray-300">{entry.pointsAgainst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Match list by round */}
      {groupByRound(matches).map(({ round, matches: roundMatches }) => (
        <div key={round}>
          <h3 className="mb-2 text-sm font-medium text-gray-400">Round {round}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roundMatches.map((match) => (
              <MatchCardPublic key={match.id} match={match} useTeams={useTeams} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function BracketTree({ matches, format, useTeams }: BracketTreeProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
        <p className="text-gray-400">No matches yet.</p>
      </div>
    )
  }

  // Round robin: always show standings table
  if (format === 'ROUND_ROBIN') {
    return <RoundRobinTable matches={matches} useTeams={useTeams} />
  }

  // Elimination formats
  const winnerMatches = matches.filter(
    (m) => m.bracketSlot?.startsWith('W-') || (!m.bracketSlot?.startsWith('L-') && !m.bracketSlot?.startsWith('GF-'))
  )
  const loserMatches = matches.filter((m) => m.bracketSlot?.startsWith('L-'))
  const gfMatches = matches.filter((m) => m.bracketSlot?.startsWith('GF-'))

  const winnerRounds = groupByRound(winnerMatches)
  const loserRounds = groupByRound(loserMatches)
  const gfRounds = groupByRound(gfMatches)

  if (isMobile) {
    // Mobile: round-by-round card list
    return (
      <div className="space-y-6">
        {format === 'DOUBLE_ELIMINATION' && winnerRounds.length > 0 && (
          <h2 className="text-lg font-semibold text-white">Winner Bracket</h2>
        )}
        {winnerRounds.map(({ round, matches: rm }) => (
          <div key={`W-${round}`}>
            <h3 className="mb-2 text-sm font-medium text-gray-400">Round {round}</h3>
            <div className="space-y-2">
              {rm.map((m) => (
                <MatchCardPublic key={m.id} match={m} useTeams={useTeams} />
              ))}
            </div>
          </div>
        ))}

        {loserRounds.length > 0 && (
          <>
            <div className="border-t border-gray-800 pt-4">
              <h2 className="text-lg font-semibold text-white">Loser Bracket</h2>
            </div>
            {loserRounds.map(({ round, matches: rm }) => (
              <div key={`L-${round}`}>
                <h3 className="mb-2 text-sm font-medium text-gray-400">Round {round}</h3>
                <div className="space-y-2">
                  {rm.map((m) => (
                    <MatchCardPublic key={m.id} match={m} useTeams={useTeams} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {gfRounds.length > 0 && (
          <>
            <div className="border-t border-gray-800 pt-4">
              <h2 className="text-lg font-semibold text-white">Grand Finals</h2>
            </div>
            {gfRounds.map(({ round, matches: rm }) => (
              <div key={`GF-${round}`}>
                <div className="space-y-2">
                  {rm.map((m) => (
                    <MatchCardPublic key={m.id} match={m} useTeams={useTeams} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  // Desktop: SVG bracket tree
  return (
    <div className="space-y-8">
      {format === 'DOUBLE_ELIMINATION' && (
        <h2 className="text-lg font-semibold text-white">Winner Bracket</h2>
      )}
      {winnerRounds.length > 0 && (
        <div className="overflow-x-auto">
          <BracketSVG rounds={winnerRounds} useTeams={useTeams} />
        </div>
      )}

      {loserRounds.length > 0 && (
        <div className="border-t border-gray-800 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Loser Bracket</h2>
          <div className="overflow-x-auto">
            <BracketSVG rounds={loserRounds} useTeams={useTeams} />
          </div>
        </div>
      )}

      {gfRounds.length > 0 && (
        <div className="border-t border-gray-800 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Grand Finals</h2>
          <div className="overflow-x-auto">
            <BracketSVG rounds={gfRounds} useTeams={useTeams} />
          </div>
        </div>
      )}
    </div>
  )
}
