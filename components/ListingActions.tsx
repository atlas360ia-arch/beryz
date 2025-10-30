'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { publishListing, deleteListing } from '@/lib/actions/listing.actions'

interface ListingActionsProps {
  listingId: string
  status: string
}

export default function ListingActions({ listingId, status }: ListingActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = () => {
    setError(null)
    startTransition(async () => {
      const result = await publishListing(listingId)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Erreur lors de la publication')
      }
    })
  }

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteListing(listingId)
      if (result.success) {
        setShowDeleteConfirm(false)
        router.refresh()
      } else {
        setError(result.error || 'Erreur lors de la suppression')
      }
    })
  }

  return (
    <>
      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 bg-etsy-error-light text-white p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {/* Bouton Modifier */}
        <button
          onClick={() => router.push(`/seller/listings/${listingId}`)}
          disabled={isPending}
          className="flex-1 bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Modifier
        </button>

        {/* Bouton Publier (si brouillon) */}
        {status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={isPending}
            className="flex-1 bg-etsy-success hover:bg-etsy-success-dark text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Publication...' : 'Publier'}
          </button>
        )}

        {/* Bouton Voir (si publié) */}
        {status === 'published' && (
          <button
            onClick={() => router.push(`/listing/${listingId}`)}
            disabled={isPending}
            className="flex-1 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Voir
          </button>
        )}

        {/* Bouton Supprimer */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          className="bg-etsy-error hover:bg-etsy-error-dark text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-etsy-dark mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-etsy-dark-light">
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-etsy-error-light text-white p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="flex-1 bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-etsy-error hover:bg-etsy-error-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
