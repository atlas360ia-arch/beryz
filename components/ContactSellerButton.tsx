'use client'

import { useRouter } from 'next/navigation'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface ContactSellerButtonProps {
  sellerId: string
  listingId: string
  currentUserId?: string
  className?: string
}

export default function ContactSellerButton({
  sellerId,
  listingId,
  currentUserId,
  className = '',
}: ContactSellerButtonProps) {
  const router = useRouter()

  const handleContact = () => {
    if (!currentUserId) {
      // Rediriger vers la page de connexion
      router.push(`/login?redirect=/listing/${listingId}`)
      return
    }

    if (currentUserId === sellerId) {
      alert('Vous ne pouvez pas vous contacter vous-même !')
      return
    }

    // Rediriger vers la page de messages avec le vendeur pré-sélectionné
    router.push(`/seller/messages?user=${sellerId}`)
  }

  // Ne pas afficher le bouton si c'est l'annonce de l'utilisateur actuel
  if (currentUserId === sellerId) {
    return null
  }

  return (
    <button
      onClick={handleContact}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold rounded-lg transition-colors ${className}`}
    >
      <ChatBubbleLeftIcon className="h-5 w-5" />
      {currentUserId ? 'Contacter le vendeur' : 'Se connecter pour contacter'}
    </button>
  )
}
