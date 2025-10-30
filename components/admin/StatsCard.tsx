import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover-lift animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-etsy-dark-light mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-etsy-dark mb-2">{value}</p>

          {subtitle && (
            <p className="text-xs text-etsy-dark-light">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-etsy-success' : 'text-etsy-error'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-etsy-dark-light">
                vs hier
              </span>
            </div>
          )}
        </div>

        <div className="bg-etsy-primary/10 p-3 rounded-lg text-etsy-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}
