'use client'

import { useToast, Toast as ToastType } from '@/lib/context/ToastContext'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

function Toast({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-etsy-success" />,
    error: <XCircleIcon className="h-6 w-6 text-etsy-error" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-etsy-gold" />,
    info: <InformationCircleIcon className="h-6 w-6 text-etsy-info" />,
  }

  const backgrounds = {
    success: 'bg-etsy-success/10 border-etsy-success',
    error: 'bg-etsy-error/10 border-etsy-error',
    warning: 'bg-etsy-gold/10 border-etsy-gold',
    info: 'bg-etsy-info/10 border-etsy-info',
  }

  return (
    <div
      className={`
        ${backgrounds[toast.type]}
        border-l-4 rounded-lg shadow-lg p-4 mb-3
        animate-in slide-in-from-right-full duration-300
        flex items-start gap-3
        max-w-md w-full
      `}
    >
      {/* Icône */}
      <div className="flex-shrink-0 pt-0.5">{icons[toast.type]}</div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-etsy-dark">{toast.message}</p>
      </div>

      {/* Bouton fermer */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-etsy-dark-light hover:text-etsy-dark transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}
