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

// Get listings for moderation with filters
export async function getListingsForModeration(filters?: {
  status?: string
  categoryId?: string
  search?: string
  page?: number
}) {
  await requireAdmin()

  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('listings')
    .select(
      `
      *,
      category:categories(name),
      seller_profile:seller_profiles(business_name, city, verified)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Filter by status
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Filter by category
  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  // Search in title and description
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  const { data: listings, error, count } = await query

  if (error) {
    console.error('Error fetching listings for moderation:', error)
    return { listings: [], total: 0, pages: 0 }
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return {
    listings: listings || [],
    total: count || 0,
    pages: totalPages,
    currentPage: page,
  }
}

// Approve listing
export async function approveListing(listingId: string) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('listings')
    .update({ status: 'published' })
    .eq('id', listingId)

  if (error) {
    console.error('Error approving listing:', error)
    return {
      success: false,
      error: "Erreur lors de l'approbation de l'annonce",
    }
  }

  // Log the action
  await logAdminAction(adminId, 'approve_listing', listingId)

  revalidatePath('/admin/moderation')
  return { success: true }
}

// Reject listing (set to draft)
export async function rejectListing(listingId: string, reason?: string) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', listingId)

  if (error) {
    console.error('Error rejecting listing:', error)
    return { success: false, error: "Erreur lors du rejet de l'annonce" }
  }

  // Log the action with reason
  await logAdminAction(
    adminId,
    'reject_listing',
    listingId,
    reason || 'No reason provided'
  )

  revalidatePath('/admin/moderation')
  return { success: true }
}

// Delete listing permanently
export async function deleteListing(listingId: string) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  // First, delete the images from storage
  const { data: listing } = await supabase
    .from('listings')
    .select('images')
    .eq('id', listingId)
    .single()

  if (listing?.images && Array.isArray(listing.images)) {
    // Extract file paths from URLs
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

  // Delete the listing
  const { error } = await supabase.from('listings').delete().eq('id', listingId)

  if (error) {
    console.error('Error deleting listing:', error)
    return {
      success: false,
      error: "Erreur lors de la suppression de l'annonce",
    }
  }

  // Log the action
  await logAdminAction(adminId, 'delete_listing', listingId)

  revalidatePath('/admin/moderation')
  return { success: true }
}

// Get listing by ID for moderation
export async function getListingForModeration(listingId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      category:categories(name),
      seller_profile:seller_profiles(
        business_name,
        city,
        verified,
        phone,
        whatsapp,
        created_at
      )
    `
    )
    .eq('id', listingId)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return null
  }

  return listing
}

// Flag listing for review
export async function flagListing(
  listingId: string,
  reason: string,
  details?: string
) {
  const adminId = await requireAdmin()
  const supabase = await createClient()

  // Update listing status to draft (unpublish)
  const { error } = await supabase
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', listingId)

  if (error) {
    console.error('Error flagging listing:', error)
    return {
      success: false,
      error: "Erreur lors du signalement de l'annonce",
    }
  }

  // Log the action
  await logAdminAction(
    adminId,
    'flag_listing',
    listingId,
    `Reason: ${reason}. Details: ${details || 'None'}`
  )

  revalidatePath('/admin/moderation')
  return { success: true }
}

// Get admin logs for a listing
export async function getListingLogs(listingId: string) {
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
    .eq('target_id', listingId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return logs || []
}
