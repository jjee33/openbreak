'use client'

import { LogoutButton } from './LogoutButton'

interface HeaderProps {
  userName: string | null
  onMenuToggle: () => void
}

export function Header({ userName, onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 sm:px-6">
      {/* Hamburger - mobile only */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-400 hover:text-white lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer for desktop (no hamburger) */}
      <div className="hidden lg:block" />

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-gray-300">{userName}</span>
        )}
        <LogoutButton />
      </div>
    </header>
  )
}
