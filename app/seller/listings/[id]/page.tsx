import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategories, getListingById } from '@/lib/actions/listing.actions'
import ListingForm from '@/components/ListingForm'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer l'annonce
  const listing = await getListingById(id)

  if (!listing) {
    notFound()
  }

  // Vérifier que l'utilisateur est propriétaire
  if (listing.user_id !== user.id) {
    redirect('/seller/listings')
  }

  // Récupérer les catégories
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Modifier l'annonce
          </h1>
          <p className="text-etsy-dark-light">
            Mettez à jour les informations de votre annonce
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ListingForm mode="edit" listing={listing} categories={categories} />
        </div>
      </div>
    </div>
  )
}
