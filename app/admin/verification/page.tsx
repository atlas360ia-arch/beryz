import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllVerificationRequests } from '@/lib/actions/verification.actions'
import VerificationRequestsTable from '@/components/admin/VerificationRequestsTable'

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Récupérer les demandes de vérification
  const status = params.status || 'pending'
  const requestsResult = await getAllVerificationRequests(status)
  const requests = requestsResult.data || []

  // Statistiques
  const allRequestsResult = await getAllVerificationRequests('all')
  const allRequests = allRequestsResult.data || []

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter((r) => r.status === 'pending').length,
    approved: allRequests.filter((r) => r.status === 'approved').length,
    rejected: allRequests.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demandes de vérification
          </h1>
          <p className="text-gray-600">
            Gérez les demandes de vérification des vendeurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Approuvées</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Refusées</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3">
              <a
                href="/admin/verification?status=pending"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                En attente ({stats.pending})
              </a>
              <a
                href="/admin/verification?status=approved"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Approuvées ({stats.approved})
              </a>
              <a
                href="/admin/verification?status=rejected"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Refusées ({stats.rejected})
              </a>
              <a
                href="/admin/verification?status=all"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  status === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes ({stats.total})
              </a>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <VerificationRequestsTable requests={requests} />
        </div>
      </div>
    </div>
  )
}
