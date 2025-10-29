import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/actions/listing.actions'
import ListingForm from '@/components/ListingForm'

export default async function CreateListingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les catégories
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Créer une annonce
          </h1>
          <p className="text-etsy-dark-light">
            Remplissez le formulaire ci-dessous pour publier votre annonce
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ListingForm mode="create" categories={categories} />
        </div>
      </div>
    </div>
  )
}
