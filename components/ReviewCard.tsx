'use client'

import { Review } from '@/lib/actions/review.actions'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface ReviewCardProps {
  review: Review
  currentUserId?: string
  onDelete?: (reviewId: string) => void
}

export default function ReviewCard({ review, currentUserId, onDelete }: ReviewCardProps) {
  const createdDate = new Date(review.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isOwner = currentUserId === review.reviewer_id

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="w-5 h-5 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-etsy-gray rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-etsy-dark">
              {review.reviewer_profile?.business_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-etsy-dark">
                {review.reviewer_profile?.business_name || 'Utilisateur'}
              </h4>
              {review.reviewer_profile?.verified && (
                <span className="text-xs bg-etsy-success text-white px-2 py-0.5 rounded">
                  Vérifié
                </span>
              )}
            </div>
            {renderStars(review.rating)}
          </div>
        </div>

        {/* Date */}
        <span className="text-sm text-gray-500">{createdDate}</span>
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-etsy-dark mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      <p className="text-etsy-dark-light leading-relaxed mb-3">{review.comment}</p>

      {/* Listing reference */}
      {review.listing && (
        <div className="text-sm text-gray-500 mb-3">
          Concernant: <span className="font-medium">{review.listing.title}</span>
        </div>
      )}

      {/* Actions */}
      {isOwner && onDelete && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onDelete(review.id)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
