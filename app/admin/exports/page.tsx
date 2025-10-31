import AdminLayout from '@/components/admin/AdminLayout'
import ExportContent from '@/components/admin/ExportContent'
import { getExportStats } from '@/lib/actions/export.actions'

export default async function ExportsPage() {
  const stats = await getExportStats()

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-etsy-dark mb-2">
          Exporter les Données
        </h1>
        <p className="text-etsy-dark-light">
          Téléchargez les données de la plateforme au format CSV
        </p>
      </div>

      {/* Content */}
      <ExportContent stats={stats} />
    </AdminLayout>
  )
}
