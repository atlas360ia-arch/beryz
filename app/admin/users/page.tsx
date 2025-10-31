import { getUsersForManagement } from '@/lib/actions/user.actions'
import AdminLayout from '@/components/admin/AdminLayout'
import UserContent from '@/components/admin/UserContent'

interface PageProps {
  searchParams: Promise<{
    search?: string
    role?: string
    banned?: string
    verified?: string
    page?: string
  }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Fetch users based on filters
  const { users, total, pages, currentPage } = await getUsersForManagement({
    search: params.search,
    role: params.role,
    banned: params.banned,
    verified: params.verified,
    page: params.page ? parseInt(params.page) : 1,
  })

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-etsy-dark mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-etsy-dark-light">
          Gérez les utilisateurs, rôles et permissions de la plateforme
        </p>
      </div>

      {/* Content */}
      <UserContent
        initialUsers={users}
        initialTotal={total}
        initialPages={pages}
        initialPage={currentPage || 1}
      />
    </AdminLayout>
  )
}
