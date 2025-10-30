import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/lib/context/ToastContext'
import ToastContainer from '@/components/ToastContainer'

export const metadata: Metadata = {
  title: 'Annonces Guinée - Trouvez et vendez localement',
  description: 'Plateforme d\'annonces gratuite pour la Guinée Conakry. Achetez et vendez en toute confiance.',
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
