'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createTournament, type CreateTournamentState } from '@/lib/actions/tournament'

export default function NewTournamentPage() {
  const [state, formAction, pending] = useActionState<CreateTournamentState, FormData>(
    createTournament,
    {}
  )

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/tournaments"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          &larr; Back to tournaments
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white">New Tournament</h1>
      <p className="mt-2 text-gray-400">Set up a new tournament for your venue.</p>

      <form action={formAction} className="mt-8 space-y-5">
        {state.error && (
          <div className="rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Tournament Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Friday Night 8-Ball"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-300">
              Format
            </label>
            <select
              id="format"
              name="format"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="SINGLE_ELIMINATION">Single Elimination</option>
              <option value="DOUBLE_ELIMINATION">Double Elimination</option>
              <option value="ROUND_ROBIN">Round Robin</option>
            </select>
          </div>

          <div>
            <label htmlFor="gameType" className="block text-sm font-medium text-gray-300">
              Game Type
            </label>
            <select
              id="gameType"
              name="gameType"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="EIGHT_BALL">8-Ball</option>
              <option value="NINE_BALL">9-Ball</option>
              <option value="TEN_BALL">10-Ball</option>
            </select>
          </div>

          <div>
            <label htmlFor="teamType" className="block text-sm font-medium text-gray-300">
              Team Type
            </label>
            <select
              id="teamType"
              name="teamType"
              required
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="PAIRS">Pairs</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
            Start Date <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-cyan-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
          >
            {pending ? 'Creating...' : 'Create Tournament'}
          </button>
          <Link
            href="/dashboard/tournaments"
            className="rounded-lg border border-gray-700 px-6 py-2.5 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
