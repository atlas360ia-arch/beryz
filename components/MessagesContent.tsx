'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ConversationList from './ConversationList'
import MessageThread from './MessageThread'
import MessageInput from './MessageInput'
import { getMessages, markAsRead } from '@/lib/actions/message.actions'
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

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

interface MessagesContentProps {
  initialConversations: Conversation[]
  currentUserId: string
}

export default function MessagesContent({
  initialConversations,
  currentUserId,
}: MessagesContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')

  const [conversations, setConversations] = useState(initialConversations)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userId || (initialConversations.length > 0 ? initialConversations[0].userId : null)
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  // Callback pour recharger quand un nouveau message arrive
  const handleNewMessage = useCallback(() => {
    // Recharger les messages si une conversation est sélectionnée
    if (selectedUserId) {
      getMessages(selectedUserId).then(setMessages)
    }
    // Rafraîchir la liste des conversations
    router.refresh()
  }, [selectedUserId, router])

  // Hook real-time: écouter les nouveaux messages
  useRealtimeMessages({
    userId: currentUserId,
    onNewMessage: handleNewMessage,
  })

  // Charger les messages quand on sélectionne une conversation
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setLoading(true)
      const msgs = await getMessages(selectedUserId)
      setMessages(msgs)
      setLoading(false)

      // Marquer comme lu
      await markAsRead(selectedUserId)

      // Rafraîchir la liste des conversations
      router.refresh()
    }

    loadMessages()
  }, [selectedUserId, router])

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId)
    // Mettre à jour l'URL
    router.push(`/seller/messages?user=${userId}`, { scroll: false })
  }

  const handleMessageSent = () => {
    // Recharger les messages
    if (selectedUserId) {
      getMessages(selectedUserId).then(setMessages)
    }
    // Rafraîchir la liste des conversations
    router.refresh()
  }

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedUserId
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-lg border border-etsy-gray overflow-hidden">
      {/* Sidebar gauche: Liste des conversations */}
      <div className="w-full md:w-80 lg:w-96 border-r border-etsy-gray flex flex-col">
        <div className="p-4 border-b border-etsy-gray bg-etsy-secondary-light">
          <h2 className="text-lg font-semibold text-etsy-dark flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-etsy-primary" />
            Messages
          </h2>
          <p className="text-sm text-etsy-dark-light mt-1">
            {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
          </p>
        </div>

        <ConversationList
          conversations={conversations}
          selectedUserId={selectedUserId || undefined}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Zone principale: Messages */}
      <div className="flex-1 flex flex-col">
        {selectedUserId && selectedConversation ? (
          <>
            {/* Header conversation */}
            <div className="p-4 border-b border-etsy-gray bg-etsy-secondary-light">
              <h3 className="text-lg font-semibold text-etsy-dark">
                {selectedConversation.userEmail}
              </h3>
              {selectedConversation.listing && (
                <p className="text-sm text-etsy-primary">
                  Re: {selectedConversation.listing.title}
                </p>
              )}
            </div>

            {/* Thread de messages */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etsy-primary"></div>
              </div>
            ) : (
              <>
                <MessageThread
                  messages={messages}
                  currentUserId={currentUserId}
                  otherUserEmail={selectedConversation.userEmail}
                />

                {/* Input de message */}
                <MessageInput
                  receiverId={selectedUserId}
                  listingId={selectedConversation.listing?.id}
                  onMessageSent={handleMessageSent}
                />
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-etsy-gray mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-etsy-dark mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-sm text-etsy-dark-light">
                Choisissez une conversation pour voir les messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
