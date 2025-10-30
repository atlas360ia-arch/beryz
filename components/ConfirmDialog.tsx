'use client'

import { ReactNode } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  icon,
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-etsy-error/10',
      iconColor: 'text-etsy-error',
      confirmBtn: 'bg-etsy-error hover:bg-etsy-error-dark',
    },
    warning: {
      iconBg: 'bg-etsy-gold/10',
      iconColor: 'text-etsy-gold',
      confirmBtn: 'bg-etsy-gold hover:bg-etsy-gold-dark',
    },
    info: {
      iconBg: 'bg-etsy-primary/10',
      iconColor: 'text-etsy-primary',
      confirmBtn: 'bg-etsy-primary hover:bg-etsy-primary-dark',
    },
  }

  const styles = variantStyles[variant]
  const defaultIcon = <ExclamationTriangleIcon className="h-6 w-6" />

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-scale-in">
          {/* Icon */}
          <div className={`${styles.iconBg} ${styles.iconColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
            {icon || defaultIcon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-etsy-dark mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-etsy-dark-light mb-6">{description}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 ${styles.confirmBtn} text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Chargement...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
