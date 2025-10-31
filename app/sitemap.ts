import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Récupérer toutes les annonces actives pour le sitemap
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(10000) // Limite de 10k annonces

  const listingPages: MetadataRoute.Sitemap =
    listings?.map((listing) => ({
      url: `${baseUrl}/listing/${listing.id}`,
      lastModified: new Date(listing.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })) || []

  // Récupérer toutes les catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${baseUrl}/browse?category=${category.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })) || []

  return [...staticPages, ...listingPages, ...categoryPages]
}
