import AdminLayout from '@/components/admin/AdminLayout'
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard'
import {
  getGrowthMetrics,
  getCategoryDistribution,
  getCityDistribution,
  getTopSellers,
  getPlatformOverview,
} from '@/lib/actions/reports.actions'
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline'

export default async function ReportsPage() {
  const [growth, categories, cities, sellers, overview] = await Promise.all([
    getGrowthMetrics(),
    getCategoryDistribution(),
    getCityDistribution(),
    getTopSellers(),
    getPlatformOverview(),
  ])

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-etsy-dark mb-2">
          Rapports & Statistiques
        </h1>
        <p className="text-etsy-dark-light">
          Analyse détaillée de l&apos;activité de la plateforme
        </p>
      </div>

      {/* Platform Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-etsy-dark mb-4">
          Vue d&apos;ensemble
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedStatsCard
            title="Total Utilisateurs"
            value={overview.totalUsers}
            icon={<UserGroupIcon />}
            subtitle={`${overview.verifiedSellers} vérifiés`}
            color="primary"
          />
          <EnhancedStatsCard
            title="Annonces Publiées"
            value={overview.publishedListings}
            icon={<DocumentTextIcon />}
            subtitle={`${overview.totalListings} au total`}
            color="success"
          />
          <EnhancedStatsCard
            title="Total Messages"
            value={overview.totalMessages}
            icon={<ChatBubbleLeftRightIcon />}
            color="info"
          />
          <EnhancedStatsCard
            title="Total Vues"
            value={overview.totalViews.toLocaleString()}
            icon={<EyeIcon />}
            color="warning"
          />
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-etsy-dark mb-4">
          Croissance (30 derniers jours)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedStatsCard
            title="Nouveaux Utilisateurs"
            value={growth.users.current}
            icon={<UserGroupIcon />}
            trend={{
              value: growth.users.growth,
              label: `vs ${growth.users.previous} le mois précédent`,
              isPositive: growth.users.growth >= 0,
            }}
            color="primary"
          />
          <EnhancedStatsCard
            title="Nouvelles Annonces"
            value={growth.listings.current}
            icon={<DocumentTextIcon />}
            trend={{
              value: growth.listings.growth,
              label: `vs ${growth.listings.previous} le mois précédent`,
              isPositive: growth.listings.growth >= 0,
            }}
            color="success"
          />
          <EnhancedStatsCard
            title="Nouveaux Messages"
            value={growth.messages.current}
            icon={<ChatBubbleLeftRightIcon />}
            trend={{
              value: growth.messages.growth,
              label: `vs ${growth.messages.previous} le mois précédent`,
              isPositive: growth.messages.growth >= 0,
            }}
            color="info"
          />
        </div>
      </div>

      {/* Distribution Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-etsy-dark mb-4">
            Annonces par Catégorie
          </h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const maxCount = categories[0]?.count || 1
              const percentage = (category.count / maxCount) * 100

              return (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-etsy-dark">
                      {category.name}
                    </span>
                    <span className="text-sm text-etsy-dark-light">
                      {category.count}
                    </span>
                  </div>
                  <div className="w-full bg-etsy-gray-light rounded-full h-2">
                    <div
                      className="bg-etsy-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* City Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-etsy-dark mb-4">
            Top 10 Villes
          </h2>
          <div className="space-y-3">
            {cities.map((city) => {
              const maxCount = cities[0]?.count || 1
              const percentage = (city.count / maxCount) * 100

              return (
                <div key={city.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-etsy-dark">
                      {city.name}
                    </span>
                    <span className="text-sm text-etsy-dark-light">
                      {city.count}
                    </span>
                  </div>
                  <div className="w-full bg-etsy-gray-light rounded-full h-2">
                    <div
                      className="bg-etsy-success h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
        <h2 className="text-xl font-semibold text-etsy-dark mb-4">
          Top 10 Vendeurs
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-etsy-gray-light">
                <th className="text-left py-3 px-4 text-sm font-medium text-etsy-dark">
                  Rang
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-etsy-dark">
                  Vendeur
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-etsy-dark">
                  Annonces
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-etsy-dark">
                  Vues Totales
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-etsy-dark">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => (
                <tr
                  key={seller.user_id}
                  className="border-b border-etsy-gray-light hover:bg-etsy-secondary-light"
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-etsy-primary">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-etsy-dark">
                        {seller.business_name}
                      </span>
                      {seller.verified && (
                        <CheckBadgeIcon className="w-5 h-5 text-etsy-success" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-etsy-dark">
                    {seller.listingsCount}
                  </td>
                  <td className="py-3 px-4 text-center text-etsy-dark">
                    {seller.totalViews.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-etsy-gold font-semibold">
                      {seller.rating.toFixed(1)} ⭐
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
