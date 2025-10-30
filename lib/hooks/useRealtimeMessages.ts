'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseRealtimeMessagesProps {
  userId: string
  onNewMessage?: () => void
}

/**
 * Hook pour écouter les nouveaux messages en temps réel
 */
export function useRealtimeMessages({
  userId,
  onNewMessage,
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    const supabase = createClient()

    // S'abonner aux nouveaux messages où l'utilisateur est le destinataire
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          console.log('Nouveau message reçu!')
          onNewMessage?.()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`,
        },
        () => {
          // Mise à jour de message (ex: marqué comme lu)
          onNewMessage?.()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onNewMessage])
}
