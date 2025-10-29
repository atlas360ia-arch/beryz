import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SellerListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les annonces du vendeur
  const { data: listings } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-etsy-dark mb-2">
              Mes annonces
            </h1>
            <p className="text-etsy-dark-light">
              Gérez vos annonces et suivez leur performance
            </p>
          </div>
          <Link
            href="/seller/listings/create"
            className="bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Nouvelle annonce
          </Link>
        </div>

        {/* Liste des annonces */}
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-etsy-gray-light flex items-center justify-center">
                  <span className="text-etsy-gray-dark">Pas d'image</span>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        listing.status === 'published'
                          ? 'bg-etsy-success-light text-white'
                          : 'bg-etsy-gray text-etsy-dark'
                      }`}
                    >
                      {listing.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="text-sm text-etsy-dark-light">
                      {listing.views_count} vues
                    </span>
                  </div>

                  <h3 className="font-semibold text-etsy-dark mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  {listing.price && (
                    <p className="text-lg font-bold text-etsy-primary mb-2">
                      {listing.price.toLocaleString()} {listing.currency}
                    </p>
                  )}

                  <p className="text-sm text-etsy-dark-light mb-4">
                    {listing.location_city}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/seller/listings/${listing.id}/edit`}
                      className="flex-1 text-center bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Modifier
                    </Link>
                    <Link
                      href={`/listing/${listing.id}`}
                      className="flex-1 text-center bg-etsy-primary hover:bg-etsy-primary-dark text-white font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* État vide */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-etsy-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-etsy-gray-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-etsy-dark mb-2">
                Aucune annonce
              </h2>
              <p className="text-etsy-dark-light mb-6">
                Commencez à vendre en créant votre première annonce
              </p>
              <Link
                href="/seller/listings/create"
                className="inline-block bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Créer ma première annonce
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
