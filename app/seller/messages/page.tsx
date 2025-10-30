import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConversations } from '@/lib/actions/message.actions'
import MessagesContent from '@/components/MessagesContent'

export default async function MessagesPage() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les conversations
  const conversations = await getConversations()

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etsy-primary"></div>
            </div>
          }
        >
          <MessagesContent
            initialConversations={conversations}
            currentUserId={user.id}
          />
        </Suspense>
      </div>
    </div>
  )
}
