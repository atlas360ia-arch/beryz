'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { addToFavorites, removeFromFavorites } from '@/lib/actions/favorite.actions'
import { useToast } from '@/lib/context/ToastContext'

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorite: boolean
  currentUserId?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function FavoriteButton({
  listingId,
  initialIsFavorite,
  currentUserId,
  size = 'md',
  showLabel = false,
  className = '',
}: FavoriteButtonProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      // Rediriger vers la page de connexion
      router.push(`/login?redirect=/listing/${listingId}`)
      return
    }

    // Optimistic UI update
    setIsFavorite(!isFavorite)

    startTransition(async () => {
      const result = isFavorite
        ? await removeFromFavorites(listingId)
        : await addToFavorites(listingId)

      if (!result.success) {
        // Rollback si erreur
        setIsFavorite(isFavorite)
        addToast('error', result.error || 'Une erreur est survenue')
      } else {
        addToast(
          'success',
          isFavorite
            ? 'Annonce retirée des favoris'
            : 'Annonce ajoutée aux favoris'
        )
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center gap-2
        ${isFavorite ? 'bg-etsy-error/10' : 'bg-white'}
        hover:bg-etsy-error/20
        border border-etsy-gray
        rounded-full
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? (
        <HeartSolidIcon className={`${iconSizes[size]} text-etsy-error`} />
      ) : (
        <HeartIcon className={`${iconSizes[size]} text-etsy-dark-light`} />
      )}
      {showLabel && (
        <span className="text-sm font-medium text-etsy-dark">
          {isFavorite ? 'Retirer' : 'Ajouter'}
        </span>
      )}
    </button>
  )
}
