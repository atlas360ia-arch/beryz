'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

// Log admin action
async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  details?: string
) {
  const supabase = await createClient()

  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_id: targetId,
    details,
  })
}

// Get users for management with filters
export async function getUsersForManagement(filters?: {
  search?: string
  role?: string
  banned?: string
  verified?: string
  page?: number
}) {
  await requireAdmin()

  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('seller_profiles')
    .select(
      `
      *,
      auth_user:user_id (
        email,
        created_at
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Filter by role
  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }

  // Filter by banned status
  if (filters?.banned === 'banned') {
    query = query.eq('banned', true)
  } else if (filters?.banned === 'active') {
    query = query.eq('banned', false)
  }

  // Filter by verified status
  if (filters?.verified === 'verified') {
    query = query.eq('verified', true)
  } else if (filters?.verified === 'not_verified') {
    query = query.eq('verified', false)
  }

  // Search in business name
  if (filters?.search) {
    query = query.ilike('business_name', `%${filters.search}%`)
  }

  const { data: users, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], total: 0, pages: 0 }
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    users: users || [],
    total: count || 0,
    pages: totalPages,
    currentPage: page,
  }
}

// Ban a user
export async function banUser(
  userId: string,
  reason: string,
  details?: string
) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('seller_profiles')
    .update({
      banned: true,
      banned_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: adminId,
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error banning user:', error)
    return { success: false, error: 'Erreur lors du bannissement' }
  }

  // Log the action
  await logAdminAction(
    adminId,
    'ban_user',
    userId,
    `Reason: ${reason}. Details: ${details || 'None'}`
  )

  revalidatePath('/admin/users')
  return { success: true }
}

// Unban a user
export async function unbanUser(userId: string) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('seller_profiles')
    .update({
      banned: false,
      banned_reason: null,
      banned_at: null,
      banned_by: null,
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error unbanning user:', error)
    return { success: false, error: 'Erreur lors du débannissement' }
  }

  // Log the action
  await logAdminAction(adminId, 'unban_user', userId)

  revalidatePath('/admin/users')
  return { success: true }
}

// Change user role
export async function changeUserRole(userId: string, newRole: 'user' | 'admin') {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  // Prevent admin from demoting themselves
  if (userId === adminId && newRole === 'user') {
    return {
      success: false,
      error: 'Vous ne pouvez pas vous retirer le rôle admin',
    }
  }

  const { error } = await supabase
    .from('seller_profiles')
    .update({ role: newRole })
    .eq('user_id', userId)

  if (error) {
    console.error('Error changing user role:', error)
    return { success: false, error: 'Erreur lors du changement de rôle' }
  }

  // Log the action
  await logAdminAction(adminId, 'change_role', userId, `New role: ${newRole}`)

  revalidatePath('/admin/users')
  return { success: true }
}

// Toggle verified status
export async function toggleVerified(userId: string, verified: boolean) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('seller_profiles')
    .update({ verified })
    .eq('user_id', userId)

  if (error) {
    console.error('Error toggling verified:', error)
    return {
      success: false,
      error: 'Erreur lors de la modification du statut vérifié',
    }
  }

  // Log the action
  await logAdminAction(
    adminId,
    'toggle_verified',
    userId,
    `Verified: ${verified}`
  )

  revalidatePath('/admin/users')
  return { success: true }
}

// Get user statistics
export async function getUserStats(userId: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Get user's listings count
  const { count: listingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get user's published listings count
  const { count: publishedCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published')

  // Get user's messages sent count
  const { count: messagesSent } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', userId)

  // Get user's messages received count
  const { count: messagesReceived } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)

  // Get user's favorites count
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get total views on user's listings
  const { data: viewsData } = await supabase
    .from('listings')
    .select('views_count')
    .eq('user_id', userId)

  const totalViews = viewsData?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0

  return {
    listingsCount: listingsCount || 0,
    publishedCount: publishedCount || 0,
    messagesSent: messagesSent || 0,
    messagesReceived: messagesReceived || 0,
    favoritesCount: favoritesCount || 0,
    totalViews,
  }
}

// Get user's recent listings
export async function getUserRecentListings(userId: string, limit: number = 5) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, status, price, created_at, images')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user listings:', error)
    return []
  }

  return listings || []
}

// Get user's action logs
export async function getUserActionLogs(userId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('admin_logs')
    .select(
      `
      *,
      admin:seller_profiles!admin_id(business_name)
    `
    )
    .eq('target_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return logs || []
}

// Delete user (with all their data)
export async function deleteUser(userId: string) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    return {
      success: false,
      error: 'Vous ne pouvez pas supprimer votre propre compte',
    }
  }

  // Delete user's images from storage
  const { data: listings } = await supabase
    .from('listings')
    .select('images')
    .eq('user_id', userId)

  if (listings) {
    for (const listing of listings) {
      if (listing.images && Array.isArray(listing.images)) {
        const filePaths = listing.images
          .map((url: string) => {
            const match = url.match(/listing-images\/(.+)$/)
            return match ? match[1] : null
          })
          .filter((path): path is string => Boolean(path))

        if (filePaths.length > 0) {
          await supabase.storage.from('listing-images').remove(filePaths)
        }
      }
    }
  }

  // Delete seller profile (CASCADE will delete listings, messages, etc.)
  const { error: profileError } = await supabase
    .from('seller_profiles')
    .delete()
    .eq('user_id', userId)

  if (profileError) {
    console.error('Error deleting user profile:', profileError)
    return { success: false, error: 'Erreur lors de la suppression' }
  }

  // Delete auth user
  // Note: This requires admin privileges in Supabase
  // For now, we just soft-delete by removing the profile

  // Log the action
  await logAdminAction(adminId, 'delete_user', userId)

  revalidatePath('/admin/users')
  return { success: true }
}
