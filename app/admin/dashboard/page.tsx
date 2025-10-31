import { getDashboardStats, getRecentActivity } from '@/lib/actions/admin.actions'
import { getRecentActivity as getFullActivity, getGrowthMetrics } from '@/lib/actions/reports.actions'
import AdminLayout from '@/components/admin/AdminLayout'
import EnhancedStatsCard from '@/components/admin/EnhancedStatsCard'
import QuickActions from '@/components/admin/QuickActions'
import RecentActivityFeed from '@/components/admin/RecentActivityFeed'
import {
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [stats, activity, recentActivity, growth] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getFullActivity(),
    getGrowthMetrics(),
  ])

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-etsy-dark mb-2">
          Dashboard Admin
        </h1>
        <p className="text-etsy-dark-light">
          Vue d'ensemble de la plateforme Beryz
        </p>
      </div>

      {/* Stats Cards with Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <EnhancedStatsCard
          title="Total Utilisateurs"
          value={stats.totalUsers}
          icon={<UserGroupIcon />}
          trend={{
            value: growth.users.growth,
            label: `+${stats.todayUsers} aujourd'hui`,
            isPositive: growth.users.growth >= 0,
          }}
          color="primary"
        />

        <EnhancedStatsCard
          title="Total Annonces"
          value={stats.totalListings}
          icon={<DocumentTextIcon />}
          trend={{
            value: growth.listings.growth,
            label: `+${stats.todayListings} aujourd'hui`,
            isPositive: growth.listings.growth >= 0,
          }}
          color="success"
        />

        <EnhancedStatsCard
          title="Annonces Publiées"
          value={stats.publishedListings}
          icon={<CheckCircleIcon />}
          subtitle={`${Math.round((stats.publishedListings / stats.totalListings) * 100)}% du total`}
          color="info"
        />

        <EnhancedStatsCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={<ChatBubbleLeftRightIcon />}
          trend={{
            value: growth.messages.growth,
            label: 'vs mois précédent',
            isPositive: growth.messages.growth >= 0,
          }}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-etsy-dark mb-4">
            Dernières Annonces
          </h2>

          {activity.recentListings.length === 0 ? (
            <p className="text-etsy-dark-light text-sm">
              Aucune annonce récente
            </p>
          ) : (
            <div className="space-y-4">
              {activity.recentListings.map((listing: any) => (
                <div
                  key={listing.id}
                  className="flex items-start gap-3 pb-4 border-b border-etsy-gray-light last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/listing/${listing.id}`}
                      className="font-medium text-etsy-dark hover:text-etsy-primary line-clamp-1"
                    >
                      {listing.title}
                    </Link>
                    <p className="text-sm text-etsy-dark-light mt-1">
                      Par {listing.seller_profile?.business_name || 'Vendeur'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          listing.status === 'published'
                            ? 'bg-etsy-success/10 text-etsy-success'
                            : 'bg-etsy-gray-light text-etsy-dark-light'
                        }`}
                      >
                        {listing.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                      {listing.category && (
                        <span className="text-xs text-etsy-dark-light">
                          {listing.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-etsy-dark-light flex-shrink-0">
                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/moderation"
            className="mt-6 block text-center text-sm text-etsy-primary hover:text-etsy-primary-dark font-medium"
          >
            Voir toutes les annonces →
          </Link>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-etsy-dark mb-4">
            Nouveaux Utilisateurs
          </h2>

          {activity.recentUsers.length === 0 ? (
            <p className="text-etsy-dark-light text-sm">
              Aucun utilisateur récent
            </p>
          ) : (
            <div className="space-y-4">
              {activity.recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 pb-4 border-b border-etsy-gray-light last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 bg-etsy-gray rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-etsy-dark">
                      {user.business_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-etsy-dark truncate">
                      {user.business_name || 'Utilisateur'}
                    </p>
                    <p className="text-sm text-etsy-dark-light">
                      {user.city || 'Ville non renseignée'}
                    </p>
                  </div>
                  <span className="text-xs text-etsy-dark-light flex-shrink-0">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/users"
            className="mt-6 block text-center text-sm text-etsy-primary hover:text-etsy-primary-dark font-medium"
          >
            Voir tous les utilisateurs →
          </Link>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-8">
        <RecentActivityFeed activities={recentActivity} />
      </div>
    </AdminLayout>
  )
}
