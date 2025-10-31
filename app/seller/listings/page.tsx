import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BulkListingActions from '@/components/BulkListingActions'

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
          <BulkListingActions listings={listings} />
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
