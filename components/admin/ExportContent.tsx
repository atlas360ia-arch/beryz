'use client'

import { useState } from 'react'
import {
  UserGroupIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { exportUsers, exportListings } from '@/lib/actions/export.actions'
import { useToast } from '@/lib/context/ToastContext'

interface ExportContentProps {
  stats: {
    users: number
    listings: number
    messages: number
  }
}

export default function ExportContent({ stats }: ExportContentProps) {
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (type: 'users' | 'listings') => {
    setIsExporting(type)

    try {
      const result =
        type === 'users' ? await exportUsers() : await exportListings()

      if (result.success && result.data) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', result.filename || 'export.csv')
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        addToast('success', 'Export téléchargé avec succès')
      } else {
        addToast('error', result.error || 'Erreur lors de l\'export')
      }
    } catch (error) {
      console.error('Export error:', error)
      addToast('error', 'Erreur lors de l\'export')
    } finally {
      setIsExporting(null)
    }
  }

  const exportCards = [
    {
      id: 'users',
      title: 'Utilisateurs',
      description: 'Exporter tous les utilisateurs avec leurs informations',
      count: stats.users,
      icon: <UserGroupIcon className="w-8 h-8" />,
      color: 'blue',
    },
    {
      id: 'listings',
      title: 'Annonces',
      description: 'Exporter toutes les annonces (max 1000 récentes)',
      count: stats.listings,
      icon: <DocumentTextIcon className="w-8 h-8" />,
      color: 'orange',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
      },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              À propos des exports
            </h3>
            <p className="text-sm text-blue-700">
              Les fichiers CSV peuvent être ouverts avec Excel, Google Sheets ou tout autre
              tableur. Les données sont exportées avec l&apos;encodage UTF-8.
            </p>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportCards.map((card) => {
          const colors = getColorClasses(card.color)
          const isLoading = isExporting === card.id

          return (
            <div
              key={card.id}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-etsy-gray-light hover:shadow-lg transition-shadow animate-fade-in"
            >
              <div className={`p-4 rounded-lg ${colors.bg} w-fit mb-4`}>
                <div className={colors.text}>{card.icon}</div>
              </div>

              <h3 className="text-xl font-bold text-etsy-dark mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-etsy-dark-light mb-4">
                {card.description}
              </p>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold text-etsy-dark">
                    {card.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-etsy-dark-light">entrées disponibles</div>
                </div>
              </div>

              <button
                onClick={() => handleExport(card.id as 'users' | 'listings')}
                disabled={isLoading || card.count === 0}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  card.count === 0
                    ? 'bg-etsy-gray-light text-etsy-dark-light cursor-not-allowed'
                    : `${colors.bg} ${colors.text} hover:opacity-80`
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    <span>Export en cours...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Télécharger CSV</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Format Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-etsy-dark mb-4">
          Format des fichiers CSV
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-etsy-dark mb-2">Utilisateurs</h4>
            <p className="text-sm text-etsy-dark-light">
              Colonnes: ID, Email, Nom Commercial, Rôle, Vérifié, Banni, Ville, Note,
              Date Inscription
            </p>
          </div>

          <div>
            <h4 className="font-medium text-etsy-dark mb-2">Annonces</h4>
            <p className="text-sm text-etsy-dark-light">
              Colonnes: ID, Titre, Catégorie, Prix, Statut, Ville, Vues, Vendeur,
              Date Création
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
