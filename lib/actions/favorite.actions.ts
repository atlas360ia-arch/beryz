'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Actions pour le système de favoris
 */

interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Ajouter un listing aux favoris
 */
export async function addToFavorites(listingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier que le listing existe et est publié
  const { data: listing } = await supabase
    .from('listings')
    .select('id, status')
    .eq('id', listingId)
    .single()

  if (!listing || listing.status !== 'published') {
    return { success: false, error: 'Annonce non trouvée' }
  }

  // Vérifier si déjà en favori
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    return { success: false, error: 'Déjà dans vos favoris' }
  }

  // Ajouter aux favoris
  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    listing_id: listingId,
  })

  if (error) {
    console.error('Error adding to favorites:', error)
    return { success: false, error: 'Erreur lors de l\'ajout aux favoris' }
  }

  revalidatePath('/seller/favorites')
  revalidatePath('/browse')
  revalidatePath(`/listing/${listingId}`)

  return { success: true }
}

/**
 * Retirer un listing des favoris
 */
export async function removeFromFavorites(listingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)

  if (error) {
    console.error('Error removing from favorites:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }

  revalidatePath('/seller/favorites')
  revalidatePath('/browse')
  revalidatePath(`/listing/${listingId}`)

  return { success: true }
}

/**
 * Vérifier si un listing est dans les favoris de l'utilisateur
 */
export async function isFavorite(listingId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()

  return !!data && !error
}

/**
 * Récupérer tous les favoris de l'utilisateur
 */
export async function getFavorites(): Promise<any[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(
      `
      id,
      created_at,
      listing:listings(
        *,
        category:categories(*),
        seller_profile:seller_profiles(*)
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  // Filtrer les favoris dont le listing existe encore
  return (
    favorites
      ?.filter((fav: any) => fav.listing !== null)
      .map((fav: any) => fav.listing) || []
  )
}

/**
 * Compter le nombre de favoris de l'utilisateur
 */
export async function getFavoritesCount(): Promise<number> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error counting favorites:', error)
    return 0
  }

  return count || 0
}
