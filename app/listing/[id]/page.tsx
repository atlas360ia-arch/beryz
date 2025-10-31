import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { getListingById } from '@/lib/actions/listing.actions'
import { createClient } from '@/lib/supabase/server'
import { isFavorite } from '@/lib/actions/favorite.actions'
import ContactSellerButton from '@/components/ContactSellerButton'
import FavoriteButton from '@/components/FavoriteButton'
import ShareButtons from '@/components/ShareButtons'

// Générer les métadonnées pour SEO et Open Graph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    return {
      title: 'Annonce introuvable',
    }
  }

  const images = Array.isArray(listing.images) ? listing.images : []
  const mainImage = images[0] || '/placeholder.jpg'
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/listing/${id}`
  const priceText = listing.price ? `${listing.price.toLocaleString('fr-FR')} GNF` : 'Prix à négocier'

  return {
    title: `${listing.title} - Annonces Guinée`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      type: 'website',
      url: url,
      siteName: 'Annonces Guinée',
      locale: 'fr_GN',
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: [mainImage],
    },
    other: {
      'price': priceText,
      'availability': listing.status === 'active' ? 'in stock' : 'out of stock',
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Vérifier si c'est le propriétaire
  const isOwner = user?.id === listing.user_id

  // Vérifier si c'est un favori
  const isListingFavorite = user && !isOwner ? await isFavorite(listing.id) : false

  // Extraire les images
  const images = Array.isArray(listing.images) ? listing.images : []

  // Formater la date
  const createdDate = new Date(listing.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // URL complète pour le partage
  const listingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/listing/${listing.id}`

  // Données structurées JSON-LD pour SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: images.length > 0 ? images : ['/placeholder.jpg'],
    offers: {
      '@type': 'Offer',
      price: listing.price || 0,
      priceCurrency: 'GNF',
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: listingUrl,
    },
    ...(listing.seller_profile && {
      seller: {
        '@type': 'Organization',
        name: listing.seller_profile.business_name || 'Vendeur',
        ...(listing.seller_profile.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: listing.seller_profile.rating,
            bestRating: 5,
          },
        }),
      },
    }),
    ...(listing.category && {
      category: listing.category.name,
    }),
  }

  return (
    <>
      {/* Données structurées pour les moteurs de recherche */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-etsy-dark hover:text-etsy-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux annonces
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Images et détails */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {images.length > 0 ? (
                <div className="space-y-4 p-4">
                  {/* Image principale */}
                  <div className="relative h-96 bg-etsy-gray-light rounded-lg overflow-hidden">
                    <Image
                      src={images[0]}
                      alt={listing.title}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Miniatures */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {images.map((img: string, index: number) => (
                        <div
                          key={index}
                          className="relative h-20 bg-etsy-gray-light rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                        >
                          <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-etsy-gray-light flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 text-etsy-gray-dark mx-auto mb-4"
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
                    <p className="text-etsy-gray-dark">Aucune image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-etsy-dark mb-4">Description</h2>
              <p className="text-etsy-dark whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Partage social */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <ShareButtons
                url={listingUrl}
                title={listing.title}
                description={listing.description.slice(0, 100)}
              />
            </div>
          </div>

          {/* Colonne droite - Infos et contact */}
          <div className="space-y-6">
            {/* Info principale */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {/* Badge catégorie */}
              {listing.category && (
                <div className="mb-4">
                  <span className="inline-block bg-etsy-primary text-white text-sm px-3 py-1 rounded">
                    {listing.category.name}
                  </span>
                </div>
              )}

              {/* Titre */}
              <h1 className="text-2xl font-bold text-etsy-dark mb-4">{listing.title}</h1>

              {/* Prix */}
              {listing.price ? (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-etsy-primary">
                    {listing.price.toLocaleString('fr-FR')} GNF
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-xl text-etsy-dark-light">Prix à négocier</p>
                </div>
              )}

              {/* Localisation */}
              <div className="mb-6 pb-6 border-b border-etsy-gray-light">
                <div className="flex items-center gap-2 text-etsy-dark">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="font-medium">{listing.location_city}</span>
                </div>
              </div>

              {/* Boutons d'action */}
              {isOwner ? (
                <div className="space-y-3">
                  <Link
                    href={`/seller/listings/${listing.id}/edit`}
                    className="block w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold text-center px-6 py-3 rounded-lg transition-colors"
                  >
                    Modifier l'annonce
                  </Link>
                  <Link
                    href="/seller/listings"
                    className="block w-full bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-semibold text-center px-6 py-3 rounded-lg transition-colors"
                  >
                    Voir mes annonces
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <ContactSellerButton
                    sellerId={listing.user_id}
                    listingId={listing.id}
                    currentUserId={user?.id}
                    className="w-full"
                  />
                  <FavoriteButton
                    listingId={listing.id}
                    initialIsFavorite={isListingFavorite}
                    currentUserId={user?.id}
                    size="lg"
                    showLabel={true}
                    className="w-full px-6 py-3"
                  />
                </div>
              )}

              {/* Infos vendeur */}
              {listing.seller_profile && (
                <div className="mt-6 pt-6 border-t border-etsy-gray-light">
                  <h3 className="font-semibold text-etsy-dark mb-3">Vendeur</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-etsy-gray rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-etsy-dark">
                        {listing.seller_profile.business_name?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-etsy-dark">
                        {listing.seller_profile.business_name || 'Vendeur'}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-etsy-dark-light">
                        <span>⭐ {listing.seller_profile.rating?.toFixed(1) || '5.0'}</span>
                        {listing.seller_profile.verified && (
                          <span className="text-etsy-success">• Vérifié</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="mt-6 pt-6 border-t border-etsy-gray-light">
                <div className="flex items-center justify-between text-sm text-etsy-dark-light">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span>{createdDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
