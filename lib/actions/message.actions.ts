'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Actions pour le système de messagerie
 */

interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Envoyer un message
 */
export async function sendMessage(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  const receiver_id = formData.get('receiver_id') as string
  const listing_id = formData.get('listing_id') as string
  const message = formData.get('message') as string

  if (!receiver_id || !message) {
    return { success: false, error: 'Destinataire et message requis' }
  }

  // Ne pas envoyer de message à soi-même
  if (receiver_id === user.id) {
    return { success: false, error: 'Vous ne pouvez pas vous envoyer un message' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id,
      listing_id: listing_id || null,
      message,
      read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Erreur lors de l\'envoi du message' }
  }

  revalidatePath('/seller/messages')
  return { success: true, data }
}

/**
 * Récupérer toutes les conversations d'un utilisateur
 * Une conversation = groupe de messages entre 2 utilisateurs
 */
export async function getConversations() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Récupérer tous les messages où l'utilisateur est impliqué
  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:sender_id(id, email),
      receiver:receiver_id(id, email),
      listing:listings(id, title, images)
    `
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error || !messages) {
    console.error('Error fetching conversations:', error)
    return []
  }

  // Grouper par conversation (paire d'utilisateurs)
  const conversationsMap = new Map()

  for (const msg of messages) {
    // Déterminer l'autre utilisateur dans la conversation
    const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender

    if (!conversationsMap.has(otherUserId)) {
      // Compter les messages non lus de cette conversation
      const unreadCount = messages.filter(
        (m) => m.sender_id === otherUserId && m.receiver_id === user.id && !m.read
      ).length

      conversationsMap.set(otherUserId, {
        userId: otherUserId,
        userEmail: otherUser?.email || 'Utilisateur inconnu',
        lastMessage: msg.message,
        lastMessageDate: msg.created_at,
        listing: msg.listing,
        unreadCount,
      })
    }
  }

  return Array.from(conversationsMap.values())
}

/**
 * Récupérer tous les messages d'une conversation avec un utilisateur
 */
export async function getMessages(otherUserId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:sender_id(id, email),
      receiver:receiver_id(id, email),
      listing:listings(id, title, images)
    `
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return messages || []
}

/**
 * Marquer tous les messages d'une conversation comme lus
 */
export async function markAsRead(otherUserId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Marquer comme lus tous les messages reçus de cet utilisateur
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
    .eq('read', false)

  if (error) {
    console.error('Error marking as read:', error)
    return { success: false, error: 'Erreur' }
  }

  revalidatePath('/seller/messages')
  return { success: true }
}

/**
 * Compter le nombre total de messages non lus
 */
export async function getUnreadCount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('read', false)

  if (error) {
    console.error('Error counting unread:', error)
    return 0
  }

  return count || 0
}

/**
 * Récupérer les infos d'un utilisateur (pour affichage)
 */
export async function getUserInfo(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !profile) {
    // Fallback: récupérer juste l'email depuis auth
    const { data: authData } = await supabase.auth.admin.getUserById(userId)
    return {
      business_name: authData?.user?.email || 'Utilisateur',
      avatar_url: null,
    }
  }

  return profile
}
