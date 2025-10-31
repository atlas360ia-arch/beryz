import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default async function SellerAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer toutes les annonces du vendeur
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)

  // Calculer les statistiques globales
  const totalListings = listings?.length || 0
  const activeListings = listings?.filter((l) => l.status === 'active').length || 0
  const pendingListings = listings?.filter((l) => l.status === 'pending').length || 0
  const rejectedListings = listings?.filter((l) => l.status === 'rejected').length || 0
  const totalViews = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0

  // Compter les favoris
  const { count: totalFavorites } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .in(
      'listing_id',
      listings?.map((l) => l.id) || []
    )

  // Compter les messages reçus
  const { count: totalMessages } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)

  // Top 5 annonces par vues
  const topListings = listings
    ?.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)

  // Statistiques par catégorie
  const { data: categories } = await supabase.from('categories').select('*')

  const statsByCategory = categories?.map((category) => {
    const categoryListings = listings?.filter((l) => l.category_id === category.id) || []
    return {
      name: category.name,
      count: categoryListings.length,
      views: categoryListings.reduce((sum, l) => sum + (l.views_count || 0), 0),
    }
  }).filter((c) => c.count > 0)

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Statistiques de mes annonces
          </h1>
          <p className="text-etsy-dark-light">
            Suivez les performances de vos annonces
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Listings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Annonces totales</h3>
              <DocumentTextIcon className="w-8 h-8 text-etsy-primary" />
            </div>
            <p className="text-3xl font-bold text-etsy-dark">{totalListings}</p>
            <div className="mt-2 text-sm text-gray-500">
              {activeListings} actives, {pendingListings} en attente
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Vues totales</h3>
              <EyeIcon className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-etsy-dark">{totalViews}</p>
            <div className="mt-2 text-sm text-gray-500">
              {totalListings > 0 ? Math.round(totalViews / totalListings) : 0} vues/annonce
            </div>
          </div>

          {/* Total Favorites */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Favoris</h3>
              <HeartIcon className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-etsy-dark">{totalFavorites || 0}</p>
            <div className="mt-2 text-sm text-gray-500">
              {totalListings > 0 ? ((totalFavorites || 0) / totalListings).toFixed(1) : 0} favoris/annonce
            </div>
          </div>

          {/* Total Messages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Conversations</h3>
              <ChatBubbleLeftIcon className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-etsy-dark">{totalMessages || 0}</p>
            <div className="mt-2 text-sm text-gray-500">
              Messages reçus
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Listings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-etsy-dark mb-4">
              Top 5 annonces les plus vues
            </h2>

            {topListings && topListings.length > 0 ? (
              <div className="space-y-4">
                {topListings.map((listing, index) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="flex items-center gap-4 p-3 hover:bg-etsy-secondary-light rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-etsy-primary text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-etsy-dark truncate">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {listing.price ? `${listing.price.toLocaleString('fr-FR')} GNF` : 'Prix à négocier'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <EyeIcon className="w-5 h-5" />
                      <span className="font-semibold">{listing.views_count || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune annonce pour le moment
              </div>
            )}
          </div>

          {/* Stats by Category */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-etsy-dark mb-4">
              Annonces par catégorie
            </h2>

            {statsByCategory && statsByCategory.length > 0 ? (
              <div className="space-y-4">
                {statsByCategory.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-etsy-dark">{cat.name}</span>
                      <span className="text-gray-500">
                        {cat.count} annonce{cat.count > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-etsy-primary h-full rounded-full"
                          style={{
                            width: `${totalListings > 0 ? (cat.count / totalListings) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        {cat.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-etsy-dark mb-4">
            Statut des annonces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{activeListings}</p>
              <p className="text-sm text-gray-600 mt-1">Actives</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{pendingListings}</p>
              <p className="text-sm text-gray-600 mt-1">En attente</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{rejectedListings}</p>
              <p className="text-sm text-gray-600 mt-1">Refusées</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-600">
                {totalListings - activeListings - pendingListings - rejectedListings}
              </p>
              <p className="text-sm text-gray-600 mt-1">Autres</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
