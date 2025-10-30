'use client'

import { useState } from 'react'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon } from '@heroicons/react/24/solid'

interface Conversation {
  userId: string
  userEmail: string
  lastMessage: string
  lastMessageDate: string
  listing?: {
    id: string
    title: string
    images: string[]
  }
  unreadCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedUserId?: string
  onSelectConversation: (userId: string) => void
}

export default function ConversationList({
  conversations,
  selectedUserId,
  onSelectConversation,
}: ConversationListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    }
  }

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <ChatBubbleLeftIcon className="h-16 w-16 text-etsy-gray mb-4" />
        <h3 className="text-lg font-semibold text-etsy-dark mb-2">
          Aucune conversation
        </h3>
        <p className="text-sm text-etsy-dark-light">
          Les messages avec les acheteurs apparaîtront ici
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = conversation.userId === selectedUserId
        const hasUnread = conversation.unreadCount > 0

        return (
          <button
            key={conversation.userId}
            onClick={() => onSelectConversation(conversation.userId)}
            className={`w-full p-4 border-b border-etsy-gray-light hover:bg-etsy-secondary transition-colors text-left ${
              isSelected ? 'bg-etsy-secondary-light' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar ou icône */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  hasUnread ? 'bg-etsy-primary' : 'bg-etsy-gray-light'
                }`}
              >
                {hasUnread ? (
                  <ChatBubbleLeftSolidIcon className="h-6 w-6 text-white" />
                ) : (
                  <ChatBubbleLeftIcon className="h-6 w-6 text-etsy-dark-light" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h4
                    className={`text-sm font-medium truncate ${
                      hasUnread ? 'text-etsy-dark' : 'text-etsy-dark-light'
                    }`}
                  >
                    {conversation.userEmail}
                  </h4>
                  <span className="text-xs text-etsy-gray-dark ml-2 flex-shrink-0">
                    {formatDate(conversation.lastMessageDate)}
                  </span>
                </div>

                {/* Listing associé si disponible */}
                {conversation.listing && (
                  <p className="text-xs text-etsy-primary mb-1 truncate">
                    Re: {conversation.listing.title}
                  </p>
                )}

                {/* Dernier message */}
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      hasUnread
                        ? 'font-medium text-etsy-dark'
                        : 'text-etsy-dark-light'
                    }`}
                  >
                    {truncateMessage(conversation.lastMessage)}
                  </p>

                  {/* Badge unread count */}
                  {hasUnread && (
                    <span className="ml-2 flex-shrink-0 bg-etsy-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
