'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Actions pour la gestion des annonces (listings)
 */

interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Créer une nouvelle annonce
 */
export async function createListing(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Extraire les données du formulaire
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = formData.get('price') as string
  const location_city = formData.get('location_city') as string
  const condition = formData.get('condition') as string
  const images = formData.get('images') as string // JSON string

  // Validation
  if (!title || !description || !category_id || !location_city) {
    return { success: false, error: 'Tous les champs obligatoires doivent être remplis' }
  }

  // Créer l'annonce
  const { data, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title,
      description,
      category_id,
      price: price ? parseFloat(price) : null,
      location_city,
      condition: condition || 'good',
      images: images ? JSON.parse(images) : [],
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating listing:', error)
    return { success: false, error: 'Erreur lors de la création de l\'annonce' }
  }

  revalidatePath('/seller/listings')
  return { success: true, data }
}

/**
 * Mettre à jour une annonce existante
 */
export async function updateListing(
  listingId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier que l'utilisateur est propriétaire de l'annonce
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { success: false, error: 'Non autorisé' }
  }

  // Extraire les données
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = formData.get('price') as string
  const location_city = formData.get('location_city') as string
  const condition = formData.get('condition') as string
  const images = formData.get('images') as string

  // Mettre à jour
  const { error } = await supabase
    .from('listings')
    .update({
      title,
      description,
      category_id,
      price: price ? parseFloat(price) : null,
      location_city,
      condition: condition || 'good',
      images: images ? JSON.parse(images) : [],
    })
    .eq('id', listingId)

  if (error) {
    console.error('Error updating listing:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }

  revalidatePath('/seller/listings')
  revalidatePath(`/listing/${listingId}`)
  return { success: true }
}

/**
 * Publier une annonce (changer le statut à 'published')
 */
export async function publishListing(listingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier la propriété
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { success: false, error: 'Non autorisé' }
  }

  // Publier
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'published',
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 jours
    })
    .eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/seller/listings')
  revalidatePath(`/listing/${listingId}`)
  return { success: true }
}

/**
 * Supprimer une annonce
 */
export async function deleteListing(listingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier la propriété
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id, images')
    .eq('id', listingId)
    .single()

  if (!listing || listing.user_id !== user.id) {
    return { success: false, error: 'Non autorisé' }
  }

  // Supprimer les images du storage
  if (listing.images && Array.isArray(listing.images)) {
    for (const imageUrl of listing.images) {
      try {
        const path = imageUrl.split('/').pop()
        if (path) {
          await supabase.storage.from('listings').remove([`${user.id}/${path}`])
        }
      } catch (e) {
        console.error('Error deleting image:', e)
      }
    }
  }

  // Supprimer l'annonce
  const { error } = await supabase.from('listings').delete().eq('id', listingId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/seller/listings')
  return { success: true }
}

/**
 * Upload d'une image vers Supabase Storage
 */
export async function uploadListingImage(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const file = formData.get('file') as File

  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' }
  }

  // Validation
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { success: false, error: 'Le fichier doit faire moins de 5MB' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Format de fichier non supporté (JPG, PNG, WEBP uniquement)' }
  }

  // Générer un nom unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage.from('listings').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Erreur lors de l\'upload de l\'image' }
  }

  // Obtenir l'URL publique
  const {
    data: { publicUrl },
  } = supabase.storage.from('listings').getPublicUrl(filePath)

  return { success: true, data: { path: filePath, url: publicUrl } }
}

/**
 * Récupérer les catégories
 */
export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

/**
 * Récupérer une annonce par ID
 */
export async function getListingById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      category:categories(*),
      seller_profile:seller_profiles(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return null
  }

  return data
}

/**
 * Incrémenter le compteur de vues
 */
export async function incrementViews(listingId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_views', { listing_id: listingId })

  if (error) {
    console.error('Error incrementing views:', error)
  }
}

/**
 * Rechercher et filtrer les annonces
 */
export interface SearchParams {
  search?: string
  categoryId?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  condition?: string
  sortBy?: string
  page?: number
  limit?: number
}

export async function searchListings(params: SearchParams) {
  const supabase = await createClient()

  const {
    search = '',
    categoryId = '',
    city = '',
    minPrice = '',
    maxPrice = '',
    condition = '',
    sortBy = 'recent',
    page = 1,
    limit = 20,
  } = params

  // Construire la requête de base (seulement les annonces publiées)
  let query = supabase
    .from('listings')
    .select(
      `
      *,
      category:categories(*),
      seller_profile:seller_profiles(*)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')

  // Appliquer les filtres
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (city) {
    query = query.eq('location_city', city)
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice))
  }

  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice))
  }

  if (condition) {
    query = query.eq('condition', condition)
  }

  // Appliquer le tri
  switch (sortBy) {
    case 'popular':
      query = query.order('views_count', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false })
      break
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error searching listings:', error)
    return { listings: [], count: 0, pages: 0 }
  }

  const totalPages = count ? Math.ceil(count / limit) : 0

  return {
    listings: data || [],
    count: count || 0,
    pages: totalPages,
  }
}
