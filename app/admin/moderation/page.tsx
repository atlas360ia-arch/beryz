import { getListingsForModeration } from '@/lib/actions/moderation.actions'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import ModerationContent from '@/components/admin/ModerationContent'

interface PageProps {
  searchParams: Promise<{
    status?: string
    category?: string
    search?: string
    page?: string
  }>
}

export default async function ModerationPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Fetch categories for filter
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch listings based on filters
  const { listings, total, pages, currentPage } =
    await getListingsForModeration({
      status: params.status,
      categoryId: params.category,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    })

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-etsy-dark mb-2">
          Modération des annonces
        </h1>
        <p className="text-etsy-dark-light">
          Gérez et modérez les annonces publiées sur la plateforme
        </p>
      </div>

      {/* Content */}
      <ModerationContent
        initialListings={listings}
        initialTotal={total}
        initialPages={pages}
        initialPage={currentPage || 1}
        categories={categories || []}
      />
    </AdminLayout>
  )
}
