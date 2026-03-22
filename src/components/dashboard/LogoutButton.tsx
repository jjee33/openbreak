'use client'

import { logout } from '@/lib/actions/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-gray-400 transition-colors hover:text-white"
      >
        Sign out
      </button>
    </form>
  )
}
