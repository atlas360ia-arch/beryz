'use client'

import { useState, useEffect } from 'react'
import { Review, getSellerReviews, deleteReview } from '@/lib/actions/review.actions'
import ReviewCard from './ReviewCard'
import { useToast } from '@/lib/context/ToastContext'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

interface ReviewListProps {
  sellerId: string
  currentUserId?: string
  initialReviews?: Review[]
}

export default function ReviewList({ sellerId, currentUserId, initialReviews = [] }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { showToast } = useToast()

  const loadReviews = async (offset = 0) => {
    setLoading(true)
    const result = await getSellerReviews(sellerId, 10, offset)

    if (result.success && result.data) {
      if (offset === 0) {
        setReviews(result.data)
      } else {
        setReviews((prev) => [...prev, ...result.data])
      }

      setHasMore(result.data.length === 10)
    } else {
      showToast(result.error || 'Erreur lors du chargement des avis', 'error')
    }

    setLoading(false)
  }

  useEffect(() => {
    if (initialReviews.length === 0) {
      loadReviews()
    }
  }, [sellerId])

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return
    }

    const result = await deleteReview(reviewId)

    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      showToast('Avis supprimé avec succès', 'success')
    } else {
      showToast(result.error || 'Erreur lors de la suppression', 'error')
    }
  }

  const handleLoadMore = () => {
    loadReviews(reviews.length)
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Aucun avis pour le moment"
        description="Soyez le premier à laisser un avis pour ce vendeur"
        icon={
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-etsy-primary hover:bg-etsy-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : 'Voir plus d\'avis'}
          </button>
        </div>
      )}
    </div>
  )
}
