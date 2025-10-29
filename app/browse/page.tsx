import { createClient } from '@/lib/supabase/server'
import ListingGrid from '@/components/ListingGrid'

export default async function BrowsePage() {
  const supabase = await createClient()

  // Récupérer les annonces publiées
  const { data: listings } = await supabase
    .from('listings')
    .select('*, category:categories(*), seller_profile:seller_profiles(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Parcourir les annonces
          </h1>
          <p className="text-etsy-dark-light">
            Découvrez les dernières offres en Guinée
          </p>
        </div>

        {/* Barre de recherche simple */}
        <div className="mb-8">
          <div className="max-w-2xl">
            <input
              type="search"
              placeholder="Rechercher une annonce..."
              className="w-full px-4 py-3 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Grille d'annonces avec le nouveau composant */}
        <ListingGrid
          listings={listings || []}
          emptyMessage="Aucune annonce disponible pour le moment. Soyez le premier à publier !"
        />
      </div>
    </div>
  )
}
