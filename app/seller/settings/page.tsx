import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/actions/verification.actions'
import Link from 'next/link'

export default async function SellerSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les préférences de notification
  const prefsResult = await getNotificationPreferences()
  const prefs = prefsResult.data

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Paramètres
          </h1>
          <p className="text-etsy-dark-light">
            Gérez vos préférences de notification et paramètres du compte
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/seller/settings"
            className="px-4 py-2 bg-etsy-primary text-white rounded-lg font-medium"
          >
            Notifications
          </Link>
          <Link
            href="/seller/profile"
            className="px-4 py-2 bg-white text-etsy-dark rounded-lg font-medium hover:bg-gray-50"
          >
            Profil
          </Link>
          <Link
            href="/seller/verification"
            className="px-4 py-2 bg-white text-etsy-dark rounded-lg font-medium hover:bg-gray-50"
          >
            Vérification
          </Link>
        </div>

        {/* Formulaire de préférences */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form action={updateNotificationPreferences} className="space-y-8">
            {/* Notifications Email */}
            <div>
              <h2 className="text-xl font-bold text-etsy-dark mb-4">
                Notifications par email
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez les événements pour lesquels vous souhaitez recevoir des emails
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_new_message"
                    defaultChecked={prefs?.email_new_message ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux messages</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsque vous recevez un nouveau message
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_new_favorite"
                    defaultChecked={prefs?.email_new_favorite ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux favoris</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsqu'une annonce est ajoutée aux favoris
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_listing_approved"
                    defaultChecked={prefs?.email_listing_approved ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Annonce approuvée</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsque votre annonce est approuvée
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_listing_rejected"
                    defaultChecked={prefs?.email_listing_rejected ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Annonce refusée</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsque votre annonce est refusée
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_new_review"
                    defaultChecked={prefs?.email_new_review ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Nouvel avis</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsque vous recevez un nouvel avis
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_verification_approved"
                    defaultChecked={prefs?.email_verification_approved ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Vérification approuvée</p>
                    <p className="text-sm text-gray-600">
                      Recevez un email lorsque votre compte est vérifié
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_marketing"
                    defaultChecked={prefs?.email_marketing ?? false}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Actualités et promotions</p>
                    <p className="text-sm text-gray-600">
                      Recevez des emails sur les nouveautés et offres spéciales
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Notifications In-App */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-etsy-dark mb-4">
                Notifications dans l'application
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choisissez les notifications que vous souhaitez voir dans l'application
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="app_new_message"
                    defaultChecked={prefs?.app_new_message ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux messages</p>
                    <p className="text-sm text-gray-600">
                      Afficher une notification pour les nouveaux messages
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="app_new_favorite"
                    defaultChecked={prefs?.app_new_favorite ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux favoris</p>
                    <p className="text-sm text-gray-600">
                      Afficher une notification pour les nouveaux favoris
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="app_listing_update"
                    defaultChecked={prefs?.app_listing_update ?? true}
                    className="mt-1 w-4 h-4 text-etsy-primary border-gray-300 rounded focus:ring-etsy-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Mises à jour des annonces</p>
                    <p className="text-sm text-gray-600">
                      Afficher une notification pour les changements de statut
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Enregistrer les préférences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
