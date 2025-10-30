'use client'

import { useState, useTransition, useRef, KeyboardEvent } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { sendMessage } from '@/lib/actions/message.actions'

interface MessageInputProps {
  receiverId: string
  listingId?: string
  onMessageSent?: () => void
}

export default function MessageInput({
  receiverId,
  listingId,
  onMessageSent,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!message.trim() || isPending) return

    setError(null)

    const formData = new FormData()
    formData.append('receiver_id', receiverId)
    formData.append('message', message.trim())
    if (listingId) {
      formData.append('listing_id', listingId)
    }

    startTransition(async () => {
      const result = await sendMessage(formData)

      if (result.success) {
        setMessage('')
        // Réinitialiser la hauteur du textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
        onMessageSent?.()
      } else {
        setError(result.error || 'Erreur lors de l\'envoi')
      }
    })
  }

  // Envoyer avec Ctrl/Cmd + Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-ajuster la hauteur du textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  return (
    <div className="border-t border-etsy-gray bg-white p-4">
      {error && (
        <div className="mb-3 bg-etsy-error-light text-white text-sm p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message... (Ctrl+Enter pour envoyer)"
            disabled={isPending}
            rows={1}
            className="w-full px-4 py-3 border border-etsy-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '150px' }}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || isPending}
          className="flex-shrink-0 w-12 h-12 bg-etsy-primary text-white rounded-full flex items-center justify-center hover:bg-etsy-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Envoyer (Ctrl+Enter)"
        >
          {isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>

      <p className="text-xs text-etsy-gray-dark mt-2">
        Appuyez sur <kbd className="px-1 py-0.5 bg-etsy-gray-light rounded">Ctrl</kbd> +{' '}
        <kbd className="px-1 py-0.5 bg-etsy-gray-light rounded">Enter</kbd> pour envoyer
      </p>
    </div>
  )
}
