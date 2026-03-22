'use client'

import { useActionState } from 'react'
import { deletePlayer, type PlayerActionState } from '@/lib/actions/player'

export function DeletePlayerButton({ playerId }: { playerId: string }) {
  const [, formAction, pending] = useActionState<PlayerActionState, FormData>(
    deletePlayer,
    {}
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded p-1 text-gray-500 transition-colors hover:text-red-400 disabled:opacity-50"
        aria-label="Delete player"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  )
}
