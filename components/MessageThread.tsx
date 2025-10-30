'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at: string
  listing?: {
    id: string
    title: string
    images: string[]
  }
}

interface MessageThreadProps {
  messages: Message[]
  currentUserId: string
  otherUserEmail: string
}

export default function MessageThread({
  messages,
  currentUserId,
  otherUserEmail,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg text-etsy-dark-light mb-2">
            Aucun message pour le moment
          </p>
          <p className="text-sm text-etsy-gray-dark">
            Commencez la conversation avec {otherUserEmail}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => {
        const isOwnMessage = msg.sender_id === currentUserId
        const showDate =
          index === 0 ||
          new Date(msg.created_at).toDateString() !==
            new Date(messages[index - 1].created_at).toDateString()

        return (
          <div key={msg.id}>
            {/* Séparateur de date */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-etsy-gray-light px-3 py-1 rounded-full text-xs text-etsy-dark-light">
                  {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            )}

            {/* Listing référencé (si c'est le premier message avec ce listing) */}
            {msg.listing &&
              (index === 0 ||
                messages[index - 1].listing?.id !== msg.listing.id) && (
                <Link
                  href={`/listing/${msg.listing.id}`}
                  className="block mb-4 max-w-md mx-auto"
                >
                  <div className="bg-etsy-secondary-light border border-etsy-gray rounded-lg p-3 hover:bg-etsy-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      {msg.listing.images && msg.listing.images.length > 0 && (
                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={msg.listing.images[0]}
                            alt={msg.listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-etsy-primary font-medium mb-1">
                          Annonce concernée
                        </p>
                        <p className="text-sm text-etsy-dark font-medium truncate">
                          {msg.listing.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

            {/* Bulle de message */}
            <div
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-etsy-primary text-white rounded-br-sm'
                    : 'bg-etsy-secondary text-etsy-dark rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.message}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-white/70' : 'text-etsy-dark-light'
                  }`}
                >
                  {formatTime(msg.created_at)}
                  {isOwnMessage && (
                    <span className="ml-2">{msg.read ? '✓✓' : '✓'}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
