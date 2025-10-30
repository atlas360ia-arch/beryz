import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Icon */}
      {icon && (
        <div className="mb-6 text-etsy-gray-dark opacity-50">{icon}</div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-semibold text-etsy-dark mb-3">{title}</h3>

      {/* Description */}
      <p className="text-etsy-dark-light mb-8 max-w-md">{description}</p>

      {/* Action button */}
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  )
}
