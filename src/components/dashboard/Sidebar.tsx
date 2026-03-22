'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

interface SidebarProps {
  userRole: string
  orgName: string | null
  isOpen: boolean
  onClose: () => void
}

const HomeIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
  </svg>
)

const TrophyIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-4-8a4 4 0 018 0v1H8v-1zm-4-5h2v3a6 6 0 004 5.66M20 8h-2v3a6 6 0 01-4 5.66M6 4h12a2 2 0 012 2v2H4V6a2 2 0 012-2z" />
  </svg>
)

const UsersIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9.12-1.26a4 4 0 10-5.24 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Tournaments', href: '/dashboard/tournaments', icon: TrophyIcon },
  { label: 'Players', href: '/dashboard/players', icon: UsersIcon },
]

export function Sidebar({ userRole, orgName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-gray-900 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Org branding */}
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/dashboard" className="text-lg font-bold text-white" onClick={onClose}>
            Open<span className="text-cyan-400">Break</span>
          </Link>
        </div>

        {orgName && (
          <div className="border-b border-gray-800 px-6 py-3">
            <p className="truncate text-sm text-gray-400">{orgName}</p>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-gray-800 text-cyan-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
