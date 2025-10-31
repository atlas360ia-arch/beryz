'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import ListingActions from './ListingActions'

interface Listing {
  id: string
  title: string
  price: number | null
  location_city: string
  status: string
  views_count: number
  images: string[] | any
  category?: {
    name: string
  }
}

interface BulkListingActionsProps {
  listings: Listing[]
}

export default function BulkListingActions({ listings }: BulkListingActionsProps) {
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const toggleSelection = (listingId: string) => {
    const newSelection = new Set(selectedListings)
    if (newSelection.has(listingId)) {
      newSelection.delete(listingId)
    } else {
      newSelection.add(listingId)
    }
    setSelectedListings(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set())
    } else {
      setSelectedListings(new Set(listings.map((l) => l.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedListings.size === 0) {
      showToast('Aucune annonce sélectionnée', 'error')
      return
    }

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${selectedListings.size} annonce(s) ?`
    if (!confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)

    try {
      // Appeler l'API pour supprimer les annonces
      const response = await fetch('/api/listings/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings),
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      showToast(`${selectedListings.size} annonce(s) supprimée(s)`, 'success')
      setSelectedListings(new Set())
      router.refresh()
    } catch (error) {
      console.error('Error deleting listings:', error)
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const allSelected = selectedListings.size === listings.length && listings.length > 0

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedListings.size > 0 && (
        <div className="mb-6 bg-etsy-primary text-white p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {selectedListings.size} annonce(s) sélectionnée(s)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="w-5 h-5" />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
            <button
              onClick={() => setSelectedListings(new Set())}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="mb-4 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
          />
          <span className="text-sm text-etsy-dark font-medium">
            Tout sélectionner ({listings.length})
          </span>
        </label>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => {
          const images = Array.isArray(listing.images) ? listing.images : []
          const mainImage = images[0]
          const isSelected = selectedListings.has(listing.id)

          return (
            <div
              key={listing.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all relative ${
                isSelected ? 'ring-2 ring-etsy-primary' : ''
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(listing.id)}
                  className="w-5 h-5 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <CheckCircleIcon className="w-6 h-6 text-etsy-primary bg-white rounded-full" />
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 bg-etsy-gray-light">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-etsy-gray-dark">Pas d'image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      listing.status === 'active'
                        ? 'bg-etsy-success text-white'
                        : listing.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-etsy-gray text-etsy-dark'
                    }`}
                  >
                    {listing.status === 'active' ? 'Actif' : listing.status === 'pending' ? 'En attente' : listing.status}
                  </span>
                  <span className="text-sm text-etsy-dark-light">{listing.views_count} vues</span>
                </div>

                <h3 className="font-semibold text-etsy-dark mb-2 line-clamp-2">
                  {listing.title}
                </h3>

                {listing.price && (
                  <p className="text-lg font-bold text-etsy-primary mb-2">
                    {listing.price.toLocaleString()} GNF
                  </p>
                )}

                <p className="text-sm text-etsy-dark-light mb-4">{listing.location_city}</p>

                {/* Actions */}
                <ListingActions listingId={listing.id} status={listing.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
