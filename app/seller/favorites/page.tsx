import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFavorites } from '@/lib/actions/favorite.actions'
import ListingGrid from '@/components/ListingGrid'
import { HeartIcon } from '@heroicons/react/24/outline'

export default async function FavoritesPage() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les favoris
  const favorites = await getFavorites()

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HeartIcon className="h-8 w-8 text-etsy-error" />
            <h1 className="text-3xl font-bold text-etsy-dark">Mes favoris</h1>
          </div>
          <p className="text-etsy-dark-light">
            {favorites.length > 0
              ? `Vous avez ${favorites.length} annonce${favorites.length > 1 ? 's' : ''} en favoris`
              : 'Aucune annonce dans vos favoris'}
          </p>
        </div>

        {/* Grille des favoris */}
        {favorites.length > 0 ? (
          <ListingGrid
            listings={favorites}
            emptyMessage="Aucune annonce dans vos favoris"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <HeartIcon className="h-24 w-24 text-etsy-gray mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-etsy-dark mb-3">
              Aucun favori pour le moment
            </h2>
            <p className="text-etsy-dark-light mb-6 max-w-md mx-auto">
              Parcourez les annonces et cliquez sur le cœur pour ajouter vos annonces
              préférées à vos favoris.
            </p>
            <a
              href="/browse"
              className="inline-block bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Parcourir les annonces
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
