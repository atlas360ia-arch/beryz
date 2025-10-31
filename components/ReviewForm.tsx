'use client'

import { useState } from 'react'
import { createReview } from '@/lib/actions/review.actions'
import { useToast } from '@/lib/context/ToastContext'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface ReviewFormProps {
  sellerId: string
  listingId?: string
  onSuccess?: () => void
}

export default function ReviewForm({ sellerId, listingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      showToast('Veuillez écrire un commentaire', 'error')
      return
    }

    setIsSubmitting(true)

    const result = await createReview({
      sellerId,
      listingId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim(),
    })

    setIsSubmitting(false)

    if (result.success) {
      showToast('Avis publié avec succès', 'success')
      setRating(5)
      setTitle('')
      setComment('')
      if (onSuccess) {
        onSuccess()
      }
    } else {
      showToast(result.error || 'Erreur lors de la publication', 'error')
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            {star <= (hoveredRating || rating) ? (
              <StarIcon className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="w-8 h-8 text-gray-300" />
            )}
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-etsy-dark">
          {hoveredRating || rating}/5
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-etsy-dark mb-6">Laisser un avis</h3>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-etsy-dark mb-3">
          Votre note
        </label>
        {renderStars()}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-etsy-dark mb-2">
          Titre (optionnel)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Résumez votre expérience"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-etsy-dark mb-2">
          Votre avis *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={5}
          placeholder="Partagez votre expérience avec ce vendeur..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent resize-none"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {comment.length} caractères
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Publication...' : 'Publier l\'avis'}
      </button>
    </form>
  )
}
