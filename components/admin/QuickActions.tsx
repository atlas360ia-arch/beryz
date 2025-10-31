import Link from 'next/link'
import {
  UserGroupIcon,
  FlagIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface QuickAction {
  title: string
  description: string
  href?: string
  icon: React.ReactNode
  color: string
  onClick?: () => void
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'Utilisateurs',
      description: 'Gérer les comptes',
      href: '/admin/users',
      icon: <UserGroupIcon className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Modération',
      description: 'Annonces à modérer',
      href: '/admin/moderation',
      icon: <FlagIcon className="w-6 h-6" />,
      color: 'orange',
    },
    {
      title: 'Rapports',
      description: 'Statistiques détaillées',
      href: '/admin/reports',
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'green',
    },
    {
      title: 'Exporter',
      description: 'Télécharger données',
      href: '/admin/exports',
      icon: <ArrowDownTrayIcon className="w-6 h-6" />,
      color: 'purple',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-100',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        hover: 'hover:bg-orange-100',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        hover: 'hover:bg-green-100',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-100',
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-etsy-dark mb-4">
        Actions Rapides
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const colors = getColorClasses(action.color)

          const content = (
            <>
              <div className={`p-3 rounded-lg ${colors.bg} ${colors.text} mb-3`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-etsy-dark text-sm mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-etsy-dark-light">
                {action.description}
              </p>
            </>
          )

          if (action.href) {
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`p-4 rounded-lg border-2 border-etsy-gray-light ${colors.hover} transition-all hover:shadow-md hover:scale-105`}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`p-4 rounded-lg border-2 border-etsy-gray-light ${colors.hover} transition-all hover:shadow-md hover:scale-105 text-left`}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
