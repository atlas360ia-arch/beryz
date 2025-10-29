import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

/**
 * Client Supabase pour le côté client (navigateur)
 * À utiliser dans les composants Client (avec 'use client')
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
