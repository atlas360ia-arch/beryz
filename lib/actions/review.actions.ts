'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Review {
  id: string
  seller_id: string
  reviewer_id: string
  listing_id: string | null
  rating: number
  title: string | null
  comment: string
  created_at: string
  updated_at: string
  reviewer_profile?: {
    business_name: string
    verified: boolean
  }
  listing?: {
    title: string
  }
}

export interface CreateReviewInput {
  sellerId: string
  listingId?: string
  rating: number
  title?: string
  comment: string
}

// Créer un nouvel avis
export async function createReview(input: CreateReviewInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour laisser un avis' }
  }

  // Vérifier que l'utilisateur n'évalue pas lui-même
  if (user.id === input.sellerId) {
    return { success: false, error: 'Vous ne pouvez pas vous évaluer vous-même' }
  }

  // Vérifier si l'utilisateur a déjà laissé un avis pour ce vendeur
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', user.id)
    .eq('seller_id', input.sellerId)
    .single()

  if (existingReview) {
    return { success: false, error: 'Vous avez déjà laissé un avis pour ce vendeur' }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      seller_id: input.sellerId,
      reviewer_id: user.id,
      listing_id: input.listingId || null,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return { success: false, error: 'Erreur lors de la création de l\'avis' }
  }

  revalidatePath('/listing/[id]')
  revalidatePath('/seller/profile')

  return { success: true, data }
}

// Récupérer les avis d'un vendeur
export async function getSellerReviews(sellerId: string, limit = 10, offset = 0) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      reviewer_profile:seller_profiles!reviews_reviewer_id_fkey(
        business_name,
        verified
      ),
      listing:listings(title)
    `
    )
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching reviews:', error)
    return { success: false, error: 'Erreur lors de la récupération des avis', data: [] }
  }

  return { success: true, data: data as Review[] }
}

// Récupérer les statistiques d'avis d'un vendeur
export async function getSellerReviewStats(sellerId: string) {
  const supabase = await createClient()

  // Compter le nombre total d'avis
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', sellerId)

  // Récupérer la distribution des notes
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('seller_id', sellerId)

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  }

  let totalRating = 0

  if (reviewsData) {
    reviewsData.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      totalRating += review.rating
    })
  }

  const averageRating = totalReviews ? (totalRating / totalReviews).toFixed(1) : '5.0'

  return {
    success: true,
    data: {
      totalReviews: totalReviews || 0,
      averageRating,
      ratingDistribution,
    },
  }
}

// Vérifier si l'utilisateur peut laisser un avis pour un vendeur
export async function canUserReview(sellerId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canReview: false, reason: 'not_authenticated' }
  }

  if (user.id === sellerId) {
    return { canReview: false, reason: 'self_review' }
  }

  // Vérifier si l'utilisateur a déjà laissé un avis
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('reviewer_id', user.id)
    .eq('seller_id', sellerId)
    .single()

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  return { canReview: true }
}

// Mettre à jour un avis
export async function updateReview(reviewId: string, title: string, comment: string, rating: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({
      title,
      comment,
      rating,
    })
    .eq('id', reviewId)
    .eq('reviewer_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating review:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de l\'avis' }
  }

  revalidatePath('/listing/[id]')
  revalidatePath('/seller/profile')

  return { success: true, data }
}

// Supprimer un avis
export async function deleteReview(reviewId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté' }
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // L'utilisateur peut supprimer son propre avis ou être admin
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .or(isAdmin ? undefined : `reviewer_id.eq.${user.id}`)

  if (error) {
    console.error('Error deleting review:', error)
    return { success: false, error: 'Erreur lors de la suppression de l\'avis' }
  }

  revalidatePath('/listing/[id]')
  revalidatePath('/seller/profile')
  revalidatePath('/admin/moderation')

  return { success: true }
}

// Récupérer un avis spécifique
export async function getReviewById(reviewId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      reviewer_profile:seller_profiles!reviews_reviewer_id_fkey(
        business_name,
        verified
      ),
      seller_profile:seller_profiles!reviews_seller_id_fkey(
        business_name,
        verified
      ),
      listing:listings(title)
    `
    )
    .eq('id', reviewId)
    .single()

  if (error) {
    console.error('Error fetching review:', error)
    return { success: false, error: 'Avis introuvable', data: null }
  }

  return { success: true, data: data as Review }
}
