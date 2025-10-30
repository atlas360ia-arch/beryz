'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  FlagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Modération', href: '/admin/moderation', icon: FlagIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Signalements', href: '/admin/reports', icon: DocumentTextIcon },
  { name: 'Statistiques', href: '/admin/stats', icon: ChartBarIcon },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-etsy-dark">
            {/* Header */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 bg-etsy-primary">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors font-medium
                      ${
                        isActive
                          ? 'bg-etsy-primary text-white'
                          : 'text-etsy-gray hover:bg-etsy-dark-light'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 flex border-t border-etsy-dark-light p-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-etsy-gray hover:text-white transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour au site
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile header */}
          <div className="md:hidden bg-white shadow-sm border-b border-etsy-gray px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-etsy-dark">Admin Panel</h1>
            <Link
              href="/"
              className="text-sm text-etsy-primary hover:text-etsy-primary-dark"
            >
              Retour au site
            </Link>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
