import Link from 'next/link'
import Image from 'next/image'
import type { ListingWithDetails } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { isFavorite } from '@/lib/actions/favorite.actions'
import FavoriteButton from './FavoriteButton'

interface ListingCardProps {
  listing: ListingWithDetails
  showActions?: boolean
  showFavorite?: boolean
}

export default async function ListingCard({
  listing,
  showActions = false,
  showFavorite = true
}: ListingCardProps) {
  // Vérifier si l'utilisateur est connecté et si c'est un favori
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isListingFavorite = showFavorite && user ? await isFavorite(listing.id) : false
  // Extraire la première image
  const images = Array.isArray(listing.images) ? listing.images : []
  const mainImage = images[0]

  // Formater la date
  const createdDate = new Date(listing.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative">
      <Link href={`/listing/${listing.id}`}>
        {/* Image */}
        <div className="relative h-48 bg-etsy-gray-light overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-16 h-16 text-etsy-gray-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Badge catégorie */}
          {listing.category && (
            <div className="absolute top-2 left-2">
              <span className="bg-etsy-primary text-white text-xs px-2 py-1 rounded">
                {listing.category.name}
              </span>
            </div>
          )}

          {/* Badge statut (pour les pages vendeur) */}
          {showActions && (
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  listing.status === 'published'
                    ? 'bg-etsy-success text-white'
                    : 'bg-etsy-gray text-etsy-dark'
                }`}
              >
                {listing.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </div>
          )}

          {/* Bouton favori (seulement sur les pages publiques) */}
          {showFavorite && !showActions && (
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton
                listingId={listing.id}
                initialIsFavorite={isListingFavorite}
                currentUserId={user?.id}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Titre */}
          <h3 className="font-semibold text-etsy-dark mb-2 line-clamp-2 group-hover:text-etsy-primary transition-colors">
            {listing.title}
          </h3>

          {/* Prix */}
          {listing.price && (
            <p className="text-lg font-bold text-etsy-primary mb-2">
              {listing.price.toLocaleString('fr-FR')} GNF
            </p>
          )}

          {/* Localisation et date */}
          <div className="flex items-center justify-between text-sm text-etsy-dark-light">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{listing.location_city}</span>
            </div>
            <span>{createdDate}</span>
          </div>

          {/* Vues (pour les pages vendeur) */}
          {showActions && (
            <div className="mt-3 pt-3 border-t border-etsy-gray-light">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-etsy-dark-light">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{listing.views_count} vues</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
