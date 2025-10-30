import { Suspense } from 'react'
import { getCategories } from '@/lib/actions/listing.actions'
import BrowseContent from '@/components/BrowseContent'

export default async function BrowsePage() {
  // Récupérer les catégories (côté serveur)
  const categories = await getCategories()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-etsy-secondary-light flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etsy-primary"></div>
        </div>
      }
    >
      <BrowseContent categories={categories} />
    </Suspense>
  )
}
