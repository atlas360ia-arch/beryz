import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/api/',
          '/seller/',
          '/admin/',
          '/auth/',
          '/_next/',
          '/banned',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: [
          '/api/',
          '/seller/',
          '/admin/',
          '/auth/',
          '/banned',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
