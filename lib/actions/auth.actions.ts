'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Actions serveur pour l'authentification
 */

// Interface pour les résultats d'actions
interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signup(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('business_name') as string

  if (!email || !password) {
    redirect('/auth/signup?error=Email et mot de passe requis')
  }

  // Validation basique
  if (password.length < 6) {
    redirect('/auth/signup?error=Le mot de passe doit contenir au moins 6 caractères')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName || null,
      },
    },
  })

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (!data.user) {
    redirect('/auth/signup?error=Erreur lors de la création du compte')
  }

  // Mettre à jour le profil vendeur avec le nom de l'entreprise
  if (businessName && data.user) {
    await supabase
      .from('seller_profiles')
      .update({ business_name: businessName })
      .eq('user_id', data.user.id)
  }

  revalidatePath('/', 'layout')
  redirect('/auth/verify-email')
}

/**
 * Connexion d'un utilisateur existant
 */
export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/auth/login?error=Email et mot de passe requis')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/auth/login?error=Email ou mot de passe incorrect')
  }

  revalidatePath('/', 'layout')
  redirect('/seller/listings')
}

/**
 * Déconnexion
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    // Continue with redirect even on error
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Récupérer l'utilisateur actuel
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Récupérer le profil vendeur de l'utilisateur actuel
 */
export async function getCurrentSellerProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return profile
}

/**
 * Mettre à jour le profil vendeur
 */
export async function updateSellerProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const businessName = formData.get('business_name') as string
  const description = formData.get('description') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string

  const { error } = await supabase
    .from('seller_profiles')
    .update({
      business_name: businessName,
      description,
      phone,
      city,
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    redirect('/seller/profile?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/seller/profile')
  redirect('/seller/profile?success=Profil mis à jour avec succès')
}
