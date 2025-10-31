import Link from 'next/link'
import Image from 'next/image'
import {
  UserPlusIcon,
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

interface Activity {
  id: string
  type: 'user' | 'listing' | 'message' | 'favorite'
  title: string
  description: string
  timestamp: string
  link?: string
  image?: string
}

interface RecentActivityFeedProps {
  activities: Activity[]
}

export default function RecentActivityFeed({
  activities,
}: RecentActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    const iconClass = 'w-5 h-5'
    switch (type) {
      case 'user':
        return <UserPlusIcon className={iconClass} />
      case 'listing':
        return <DocumentPlusIcon className={iconClass} />
      case 'message':
        return <ChatBubbleLeftRightIcon className={iconClass} />
      case 'favorite':
        return <HeartIcon className={iconClass} />
      default:
        return <DocumentPlusIcon className={iconClass} />
    }
  }

  const getIconBg = (type: Activity['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 text-blue-600'
      case 'listing':
        return 'bg-etsy-primary/10 text-etsy-primary'
      case 'message':
        return 'bg-purple-50 text-purple-600'
      case 'favorite':
        return 'bg-pink-50 text-pink-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `Il y a ${minutes} min`
    } else if (hours < 24) {
      return `Il y a ${hours}h`
    } else if (days < 7) {
      return `Il y a ${days}j`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-etsy-dark mb-4">
          Activité Récente
        </h2>
        <p className="text-center text-etsy-dark-light py-8">
          Aucune activité récente
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-etsy-dark mb-4">
        Activité Récente
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-etsy-secondary-light transition-colors"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${getIconBg(
                activity.type
              )}`}
            >
              {getIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {activity.link ? (
                <Link
                  href={activity.link}
                  className="font-medium text-etsy-dark hover:text-etsy-primary line-clamp-1"
                >
                  {activity.title}
                </Link>
              ) : (
                <p className="font-medium text-etsy-dark line-clamp-1">
                  {activity.title}
                </p>
              )}
              <p className="text-sm text-etsy-dark-light line-clamp-1 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-etsy-dark-light mt-1">
                {formatTime(activity.timestamp)}
              </p>
            </div>

            {/* Image (if available) */}
            {activity.image && (
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-etsy-gray-light">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
