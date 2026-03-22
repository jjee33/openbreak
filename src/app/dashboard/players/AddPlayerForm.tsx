'use client'

import { useActionState, useRef, useEffect } from 'react'
import { createPlayer, type PlayerActionState } from '@/lib/actions/player'

export function AddPlayerForm() {
  const [state, formAction, pending] = useActionState<PlayerActionState, FormData>(
    createPlayer,
    {}
  )
  const formRef = useRef<HTMLFormElement>(null)
  const prevPending = useRef(pending)

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset()
    }
    prevPending.current = pending
  }, [pending, state.error])

  return (
    <form ref={formRef} action={formAction} className="flex gap-3">
      <div className="flex-1">
        <input
          name="displayName"
          type="text"
          required
          placeholder="Player name"
          className="block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        {state.error && (
          <p className="mt-1 text-sm text-red-400">{state.error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add Player'}
      </button>
    </form>
  )
}
