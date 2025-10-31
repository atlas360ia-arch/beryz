'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Check if user is admin
async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return user.id
}

// Get growth metrics (last 30 days)
export async function getGrowthMetrics() {
  await requireAdmin()
  const supabase = await createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const sixtyDaysAgoISO = sixtyDaysAgo.toISOString()

  // Users growth
  const { count: recentUsers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgoISO)

  const { count: previousUsers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sixtyDaysAgoISO)
    .lt('created_at', thirtyDaysAgoISO)

  const usersGrowth = previousUsers && previousUsers > 0
    ? Math.round(((recentUsers || 0) - previousUsers) / previousUsers * 100)
    : 0

  // Listings growth
  const { count: recentListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgoISO)

  const { count: previousListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sixtyDaysAgoISO)
    .lt('created_at', thirtyDaysAgoISO)

  const listingsGrowth = previousListings && previousListings > 0
    ? Math.round(((recentListings || 0) - previousListings) / previousListings * 100)
    : 0

  // Messages growth
  const { count: recentMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgoISO)

  const { count: previousMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sixtyDaysAgoISO)
    .lt('created_at', thirtyDaysAgoISO)

  const messagesGrowth = previousMessages && previousMessages > 0
    ? Math.round(((recentMessages || 0) - previousMessages) / previousMessages * 100)
    : 0

  return {
    users: {
      current: recentUsers || 0,
      previous: previousUsers || 0,
      growth: usersGrowth,
    },
    listings: {
      current: recentListings || 0,
      previous: previousListings || 0,
      growth: listingsGrowth,
    },
    messages: {
      current: recentMessages || 0,
      previous: previousMessages || 0,
      growth: messagesGrowth,
    },
  }
}

// Get category distribution
export async function getCategoryDistribution() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')

  if (!categories) return []

  const distribution = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'published')

      return {
        name: category.name,
        count: count || 0,
      }
    })
  )

  return distribution.sort((a, b) => b.count - a.count)
}

// Get city distribution
export async function getCityDistribution() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('location_city')
    .eq('status', 'published')

  if (!listings) return []

  const cityMap: Record<string, number> = {}
  listings.forEach((listing) => {
    const city = listing.location_city || 'Non spécifié'
    cityMap[city] = (cityMap[city] || 0) + 1
  })

  return Object.entries(cityMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 cities
}

// Get top sellers
export async function getTopSellers() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: sellers } = await supabase
    .from('seller_profiles')
    .select(`
      user_id,
      business_name,
      verified,
      rating
    `)

  if (!sellers) return []

  const sellersWithStats = await Promise.all(
    sellers.map(async (seller) => {
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', seller.user_id)
        .eq('status', 'published')

      const { data: listings } = await supabase
        .from('listings')
        .select('views_count')
        .eq('user_id', seller.user_id)
        .eq('status', 'published')

      const totalViews = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0

      return {
        ...seller,
        listingsCount: listingsCount || 0,
        totalViews,
      }
    })
  )

  return sellersWithStats
    .sort((a, b) => b.listingsCount - a.listingsCount)
    .slice(0, 10) // Top 10 sellers
}

// Get recent activity for dashboard
export async function getRecentActivity() {
  await requireAdmin()
  const supabase = await createClient()

  const activities: any[] = []

  // Get recent listings
  const { data: recentListings } = await supabase
    .from('listings')
    .select('id, title, created_at, images')
    .order('created_at', { ascending: false })
    .limit(5)

  recentListings?.forEach((listing) => {
    activities.push({
      id: `listing-${listing.id}`,
      type: 'listing',
      title: listing.title,
      description: 'Nouvelle annonce publiée',
      timestamp: listing.created_at,
      link: `/listing/${listing.id}`,
      image: Array.isArray(listing.images) ? listing.images[0] : undefined,
    })
  })

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('seller_profiles')
    .select('user_id, business_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  recentUsers?.forEach((user) => {
    activities.push({
      id: `user-${user.user_id}`,
      type: 'user',
      title: user.business_name || 'Nouveau vendeur',
      description: 'Nouvel utilisateur inscrit',
      timestamp: user.created_at,
    })
  })

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activities.slice(0, 10)
}

// Get platform overview stats
export async function getPlatformOverview() {
  await requireAdmin()
  const supabase = await createClient()

  // Total users
  const { count: totalUsers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })

  // Total listings
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  // Published listings
  const { count: publishedListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Total messages
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })

  // Total views
  const { data: listings } = await supabase
    .from('listings')
    .select('views_count')

  const totalViews = listings?.reduce((sum, l) => sum + (l.views_count || 0), 0) || 0

  // Verified sellers
  const { count: verifiedSellers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true)

  // Banned users
  const { count: bannedUsers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('banned', true)

  return {
    totalUsers: totalUsers || 0,
    totalListings: totalListings || 0,
    publishedListings: publishedListings || 0,
    totalMessages: totalMessages || 0,
    totalViews,
    verifiedSellers: verifiedSellers || 0,
    bannedUsers: bannedUsers || 0,
  }
}
