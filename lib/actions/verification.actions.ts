'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface VerificationRequest {
  id: string
  user_id: string
  business_name: string
  business_type: string | null
  business_registration: string | null
  phone: string
  address: string | null
  city: string | null
  id_document_url: string | null
  business_document_url: string | null
  proof_of_address_url: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  user_profile?: {
    business_name: string
    email: string
  }
}

// Créer une demande de vérification
export async function createVerificationRequest(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  // Vérifier s'il existe déjà une demande en attente
  const { data: existingRequest } = await supabase
    .from('verification_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return { success: false, error: 'Vous avez déjà une demande en attente' }
  }

  const requestData = {
    user_id: user.id,
    business_name: formData.get('business_name') as string,
    business_type: formData.get('business_type') as string,
    business_registration: formData.get('business_registration') as string || null,
    phone: formData.get('phone') as string,
    address: formData.get('address') as string || null,
    city: formData.get('city') as string || null,
    message: formData.get('message') as string || null,
    status: 'pending' as const,
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .insert(requestData)
    .select()
    .single()

  if (error) {
    console.error('Error creating verification request:', error)
    return { success: false, error: 'Erreur lors de la création de la demande' }
  }

  revalidatePath('/seller/verification')
  revalidatePath('/admin/verification')

  return { success: true, data }
}

// Récupérer la demande de vérification de l'utilisateur
export async function getUserVerificationRequest() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié', data: null }
  }

  const { data, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching verification request:', error)
    return { success: false, error: 'Erreur lors de la récupération', data: null }
  }

  return { success: true, data: data as VerificationRequest | null }
}

// Récupérer toutes les demandes de vérification (Admin)
export async function getAllVerificationRequests(status?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié', data: [] }
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Accès refusé', data: [] }
  }

  let query = supabase
    .from('verification_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching verification requests:', error)
    return { success: false, error: 'Erreur lors de la récupération', data: [] }
  }

  // Enrichir avec les informations utilisateur
  const enrichedData = await Promise.all(
    data.map(async (request) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(request.user_id)
      return {
        ...request,
        user_profile: {
          business_name: request.business_name,
          email: authUser?.user?.email || 'N/A',
        },
      }
    })
  )

  return { success: true, data: enrichedData as VerificationRequest[] }
}

// Approuver une demande de vérification (Admin)
export async function approveVerificationRequest(requestId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Accès refusé' }
  }

  const { error } = await supabase
    .from('verification_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) {
    console.error('Error approving verification request:', error)
    return { success: false, error: 'Erreur lors de l\'approbation' }
  }

  revalidatePath('/admin/verification')
  revalidatePath('/seller/verification')

  return { success: true }
}

// Rejeter une demande de vérification (Admin)
export async function rejectVerificationRequest(requestId: string, reason: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Accès refusé' }
  }

  const { error } = await supabase
    .from('verification_requests')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', requestId)

  if (error) {
    console.error('Error rejecting verification request:', error)
    return { success: false, error: 'Erreur lors du rejet' }
  }

  revalidatePath('/admin/verification')
  revalidatePath('/seller/verification')

  return { success: true }
}

// Récupérer les préférences de notification
export async function getNotificationPreferences() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié', data: null }
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification preferences:', error)
    return { success: false, error: 'Erreur lors de la récupération', data: null }
  }

  // Si pas de préférences, créer les valeurs par défaut
  if (!data) {
    const { data: newPrefs, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: 'Erreur lors de la création', data: null }
    }

    return { success: true, data: newPrefs }
  }

  return { success: true, data }
}

// Mettre à jour les préférences de notification
export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const preferences = {
    email_new_message: formData.get('email_new_message') === 'on',
    email_new_favorite: formData.get('email_new_favorite') === 'on',
    email_listing_approved: formData.get('email_listing_approved') === 'on',
    email_listing_rejected: formData.get('email_listing_rejected') === 'on',
    email_new_review: formData.get('email_new_review') === 'on',
    email_verification_approved: formData.get('email_verification_approved') === 'on',
    email_marketing: formData.get('email_marketing') === 'on',
    app_new_message: formData.get('app_new_message') === 'on',
    app_new_favorite: formData.get('app_new_favorite') === 'on',
    app_listing_update: formData.get('app_listing_update') === 'on',
  }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating notification preferences:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath('/seller/settings')

  return { success: true }
}
