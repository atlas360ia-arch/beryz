import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les IDs des annonces à supprimer
    const { listingIds } = await request.json()

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 })
    }

    // Vérifier que toutes les annonces appartiennent à l'utilisateur
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, user_id')
      .in('id', listingIds)

    if (fetchError) {
      console.error('Error fetching listings:', fetchError)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }

    // Vérifier la propriété
    const unauthorizedListings = listings?.filter((l) => l.user_id !== user.id)
    if (unauthorizedListings && unauthorizedListings.length > 0) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation de supprimer certaines annonces' },
        { status: 403 }
      )
    }

    // Supprimer les annonces
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .in('id', listingIds)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting listings:', deleteError)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deletedCount: listingIds.length,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
