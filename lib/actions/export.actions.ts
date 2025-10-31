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

// Convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',')
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header] || ''
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  return [headerRow, ...rows].join('\n')
}

// Export users to CSV
export async function exportUsers() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('seller_profiles')
    .select(`
      user_id,
      business_name,
      role,
      verified,
      banned,
      city,
      rating,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (error || !users) {
    return { success: false, error: 'Erreur lors de l\'export' }
  }

  // Get emails - Fetch emails for each user individually to avoid admin API
  const exportData = await Promise.all(users.map(async (user) => {
    // Try to get email from metadata or auth
    let email = ''
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id)
      email = authUser?.user?.email || ''
    } catch (e) {
      // If admin API fails, we skip the email
      email = 'N/A'
    }

    return {
      ID: user.user_id,
      Email: email,
      'Nom Commercial': user.business_name || '',
      Rôle: user.role,
      Vérifié: user.verified ? 'Oui' : 'Non',
      Banni: user.banned ? 'Oui' : 'Non',
      Ville: user.city || '',
      Note: user.rating,
      'Date Inscription': new Date(user.created_at).toLocaleDateString('fr-FR'),
    }
  }))

  const csv = convertToCSV(
    exportData,
    ['ID', 'Email', 'Nom Commercial', 'Rôle', 'Vérifié', 'Banni', 'Ville', 'Note', 'Date Inscription']
  )

  return {
    success: true,
    data: csv,
    filename: `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`,
  }
}

// Export listings to CSV
export async function exportListings() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      category:categories(name),
      price,
      status,
      location_city,
      views_count,
      created_at,
      seller_profile:seller_profiles(business_name)
    `)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error || !listings) {
    return { success: false, error: 'Erreur lors de l\'export' }
  }

  const exportData = listings.map(listing => ({
    ID: listing.id,
    Titre: listing.title,
    Catégorie: (listing.category as any)?.name || '',
    Prix: listing.price,
    Statut: listing.status === 'published' ? 'Publié' : 'Brouillon',
    Ville: listing.location_city,
    Vues: listing.views_count,
    Vendeur: (listing.seller_profile as any)?.business_name || '',
    'Date Création': new Date(listing.created_at).toLocaleDateString('fr-FR'),
  }))

  const csv = convertToCSV(
    exportData,
    ['ID', 'Titre', 'Catégorie', 'Prix', 'Statut', 'Ville', 'Vues', 'Vendeur', 'Date Création']
  )

  return {
    success: true,
    data: csv,
    filename: `annonces_${new Date().toISOString().split('T')[0]}.csv`,
  }
}

// Get export statistics
export async function getExportStats() {
  await requireAdmin()
  const supabase = await createClient()

  // Count users
  const { count: usersCount } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact', head: true })

  // Count listings
  const { count: listingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })

  // Count messages
  const { count: messagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })

  return {
    users: usersCount || 0,
    listings: listingsCount || 0,
    messages: messagesCount || 0,
  }
}
