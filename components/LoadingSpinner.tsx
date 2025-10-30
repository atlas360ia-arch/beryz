interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'dark'
  fullScreen?: boolean
  label?: string
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  const colorClasses = {
    primary: 'border-etsy-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    dark: 'border-etsy-dark border-t-transparent',
  }

  const spinner = (
    <div
      className={`
        animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      role="status"
      aria-label={label || 'Chargement en cours'}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 animate-fade-in">
        {spinner}
        {label && (
          <p className="mt-4 text-etsy-dark-light text-sm">{label}</p>
        )}
      </div>
    )
  }

  if (label) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {spinner}
        <p className="text-etsy-dark-light text-sm">{label}</p>
      </div>
    )
  }

  return spinner
}
