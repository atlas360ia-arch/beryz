import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/lib/context/ToastContext'
import ToastContainer from '@/components/ToastContainer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Annonces Guinée - Trouvez et vendez localement',
    template: '%s | Annonces Guinée',
  },
  description: 'Plateforme d\'annonces gratuite pour la Guinée Conakry. Achetez et vendez en toute confiance.',
  keywords: ['annonces', 'Guinée', 'Conakry', 'vendre', 'acheter', 'marketplace', 'petites annonces'],
  authors: [{ name: 'Annonces Guinée' }],
  openGraph: {
    type: 'website',
    locale: 'fr_GN',
    url: '/',
    siteName: 'Annonces Guinée',
    title: 'Annonces Guinée - Trouvez et vendez localement',
    description: 'Plateforme d\'annonces gratuite pour la Guinée Conakry. Achetez et vendez en toute confiance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annonces Guinée - Trouvez et vendez localement',
    description: 'Plateforme d\'annonces gratuite pour la Guinée Conakry. Achetez et vendez en toute confiance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-etsy-secondary-light">
        <ToastProvider>
          <Navbar />
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  )
}
