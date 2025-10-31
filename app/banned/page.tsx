import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth.actions'
import { NoSymbolIcon } from '@heroicons/react/24/outline'

export default async function BannedPage() {
  const supabase = await createClient()

  // Vérifier l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Récupérer les informations de bannissement
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('banned, banned_reason, banned_at')
    .eq('user_id', user.id)
    .single()

  // Si pas banni, rediriger vers l'accueil
  if (!profile?.banned) {
    redirect('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const reasonLabels: Record<string, string> = {
    spam: 'Spam',
    fraud: 'Fraude',
    abuse: 'Abus',
    inappropriate: 'Contenu inapproprié',
    other: 'Autre',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-etsy-secondary-light px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-etsy-error/10 rounded-full">
            <NoSymbolIcon className="h-16 w-16 text-etsy-error" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-etsy-dark mb-4">
          Compte Suspendu
        </h1>

        {/* Message */}
        <p className="text-etsy-dark-light mb-6">
          Votre compte a été suspendu et vous ne pouvez plus accéder à la
          plateforme.
        </p>

        {/* Details */}
        {profile.banned_reason && (
          <div className="bg-etsy-gray-light rounded-lg p-4 mb-6 text-left">
            <div className="mb-3">
              <span className="text-sm font-medium text-etsy-dark">Raison:</span>
              <p className="text-etsy-dark-light mt-1">
                {reasonLabels[profile.banned_reason] || profile.banned_reason}
              </p>
            </div>

            {profile.banned_at && (
              <div>
                <span className="text-sm font-medium text-etsy-dark">Date:</span>
                <p className="text-etsy-dark-light mt-1">
                  {formatDate(profile.banned_at)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        <p className="text-sm text-etsy-dark-light mb-6">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez
          contacter notre équipe support.
        </p>

        {/* Logout Button */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full bg-etsy-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-etsy-primary-dark transition-colors"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
