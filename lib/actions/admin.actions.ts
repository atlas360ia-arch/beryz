'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server Actions pour l'administration
 */

/**
 * Vérifier si l'utilisateur connecté est un admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return profile?.role === 'admin'
}

/**
 * Vérifier les permissions admin et rediriger si non autorisé
 */
export async function requireAdmin() {
  const isUserAdmin = await isAdmin()

  if (!isUserAdmin) {
    redirect('/')
  }
}

/**
 * Récupérer les statistiques globales du dashboard
 */
export async function getDashboardStats() {
  await requireAdmin()

  const supabase = await createClient()

  // Compter les utilisateurs
  const { count: usersCount } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })

  // Compter les listings (total)
  const { count: listingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  // Compter les listings publiés
  const { count: publishedCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Compter les messages
  const { count: messagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })

  // Activité aujourd'hui (nouveaux listings)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Nouveaux utilisateurs aujourd'hui
  const { count: todayUsers } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  return {
    totalUsers: usersCount || 0,
    totalListings: listingsCount || 0,
    publishedListings: publishedCount || 0,
    totalMessages: messagesCount || 0,
    todayListings: todayListings || 0,
    todayUsers: todayUsers || 0,
  }
}

/**
 * Récupérer l'activité récente (derniers listings et utilisateurs)
 */
export async function getRecentActivity() {
  await requireAdmin()

  const supabase = await createClient()

  // Derniers listings créés
  const { data: recentListings } = await supabase
    .from('listings')
    .select('*, seller_profile:seller_profiles(*), category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Derniers utilisateurs inscrits
  const { data: recentUsers } = await supabase
    .from('seller_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    recentListings: recentListings || [],
    recentUsers: recentUsers || [],
  }
}

/**
 * Récupérer les données pour les graphiques (listings par jour)
 */
export async function getChartData(days: number = 7) {
  await requireAdmin()

  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: listings } = await supabase
    .from('listings')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Grouper par jour
  const listingsByDay: Record<string, number> = {}

  listings?.forEach((listing) => {
    const date = new Date(listing.created_at).toLocaleDateString('fr-FR')
    listingsByDay[date] = (listingsByDay[date] || 0) + 1
  })

  return Object.entries(listingsByDay).map(([date, count]) => ({
    date,
    count,
  }))
}
