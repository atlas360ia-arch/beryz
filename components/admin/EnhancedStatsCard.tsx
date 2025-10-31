import { ReactNode } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface EnhancedStatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  subtitle?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

export default function EnhancedStatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'primary',
}: EnhancedStatsCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-etsy-primary/10',
      text: 'text-etsy-primary',
      border: 'border-etsy-primary/20',
    },
    success: {
      bg: 'bg-etsy-success/10',
      text: 'text-etsy-success',
      border: 'border-etsy-success/20',
    },
    warning: {
      bg: 'bg-etsy-gold/10',
      text: 'text-etsy-gold',
      border: 'border-etsy-gold/20',
    },
    error: {
      bg: 'bg-etsy-error/10',
      text: 'text-etsy-error',
      border: 'border-etsy-error/20',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
  }

  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow animate-fade-in"
         style={{ borderLeftColor: colors.border.replace('border-', '') }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <div className={`w-6 h-6 ${colors.text}`}>{icon}</div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive !== false
                ? 'bg-etsy-success/10 text-etsy-success'
                : 'bg-etsy-error/10 text-etsy-error'
            }`}
          >
            {trend.isPositive !== false ? (
              <ArrowTrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-etsy-dark-light">{title}</h3>
        <p className="text-3xl font-bold text-etsy-dark">{value}</p>
        {(subtitle || trend) && (
          <p className="text-xs text-etsy-dark-light mt-2">
            {trend?.label || subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
