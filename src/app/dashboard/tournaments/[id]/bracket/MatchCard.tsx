'use client'

import { useActionState } from 'react'
import { updateScore, type BracketActionState } from '@/lib/actions/bracket'

interface MatchParticipant {
  id: string
  displayName?: string
  name?: string
}

interface MatchData {
  id: string
  round: number
  matchNumber: number
  bracketSlot: string | null
  score1: number | null
  score2: number | null
  completedAt: Date | null
  player1: MatchParticipant | null
  player2: MatchParticipant | null
  team1: MatchParticipant | null
  team2: MatchParticipant | null
  winnerPlayer: { id: string } | null
  winnerTeam: { id: string } | null
}

interface MatchCardProps {
  match: MatchData
  useTeams: boolean
}

export function MatchCard({ match, useTeams }: MatchCardProps) {
  const [state, formAction, pending] = useActionState<BracketActionState, FormData>(
    updateScore,
    {}
  )

  const p1 = useTeams ? match.team1 : match.player1
  const p2 = useTeams ? match.team2 : match.player2
  const p1Name = p1 ? (p1.displayName ?? p1.name ?? 'TBD') : 'BYE'
  const p2Name = p2 ? (p2.displayName ?? p2.name ?? 'TBD') : 'BYE'

  const winnerId = useTeams ? match.winnerTeam?.id : match.winnerPlayer?.id
  const p1IsWinner = winnerId && p1 && winnerId === p1.id
  const p2IsWinner = winnerId && p2 && winnerId === p2.id

  return (
    <div className="w-64 rounded-lg border border-gray-800 bg-gray-900 p-3">
      <div className="mb-2 text-xs text-gray-500">
        {match.bracketSlot ?? `M${match.matchNumber}`}
      </div>

      <form action={formAction}>
        <input type="hidden" name="matchId" value={match.id} />

        {/* Participant 1 */}
        <div className="flex items-center gap-2">
          <span
            className={`flex-1 truncate text-sm ${
              p1IsWinner ? 'font-semibold text-cyan-400' : 'text-white'
            }`}
          >
            {p1Name}
          </span>
          <input
            name="score1"
            type="number"
            min={0}
            defaultValue={match.score1 ?? ''}
            className="w-12 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
          {p1 && (
            <label className="flex items-center">
              <input
                type="radio"
                name="winnerId"
                value={p1.id}
                defaultChecked={p1IsWinner || false}
                className="sr-only"
              />
              <span
                className={`cursor-pointer rounded px-1.5 py-0.5 text-xs ${
                  p1IsWinner
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                W
              </span>
            </label>
          )}
        </div>

        <div className="my-1 border-t border-gray-800" />

        {/* Participant 2 */}
        <div className="flex items-center gap-2">
          <span
            className={`flex-1 truncate text-sm ${
              p2IsWinner ? 'font-semibold text-cyan-400' : 'text-white'
            }`}
          >
            {p2Name}
          </span>
          <input
            name="score2"
            type="number"
            min={0}
            defaultValue={match.score2 ?? ''}
            className="w-12 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
          {p2 && (
            <label className="flex items-center">
              <input
                type="radio"
                name="winnerId"
                value={p2.id}
                defaultChecked={p2IsWinner || false}
                className="sr-only"
              />
              <span
                className={`cursor-pointer rounded px-1.5 py-0.5 text-xs ${
                  p2IsWinner
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                W
              </span>
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded bg-gray-800 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Score'}
        </button>

        {state.error && (
          <p className="mt-1 text-xs text-red-400">{state.error}</p>
        )}
      </form>
    </div>
  )
}
