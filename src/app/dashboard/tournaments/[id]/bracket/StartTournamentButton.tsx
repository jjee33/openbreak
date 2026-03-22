'use client'

import { useActionState } from 'react'
import { startTournament, type BracketActionState } from '@/lib/actions/bracket'

export function StartTournamentButton({ tournamentId }: { tournamentId: string }) {
  const [state, formAction, pending] = useActionState<BracketActionState, FormData>(
    startTournament,
    {}
  )

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {pending ? 'Starting...' : 'Start Tournament'}
        </button>
      </form>
      {state.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </div>
  )
}
