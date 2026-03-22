'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export function PublicNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')

  // Hide on dashboard, admin, login, and register pages
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-lg font-bold text-white">
          Open<span className="text-cyan-400">Break</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden flex-1 justify-center sm:flex">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or zip"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 pl-8 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <svg
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        </form>

        {/* Auth links */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  )
}
