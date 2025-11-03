import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserVerificationRequest, createVerificationRequest } from '@/lib/actions/verification.actions'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'

export default async function SellerVerificationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le profil vendeur
  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Récupérer la demande de vérification existante
  const requestResult = await getUserVerificationRequest()
  const existingRequest = requestResult.data

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Vérification du compte vendeur
          </h1>
          <p className="text-etsy-dark-light">
            Obtenez un badge vérifié pour inspirer confiance à vos acheteurs
          </p>
        </div>

        {/* Statut actuel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-etsy-dark mb-4">Statut actuel</h2>

          {profile?.verified ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Compte vérifié</p>
                <p className="text-sm text-green-700">
                  Votre compte est vérifié et vous avez un badge visible sur vos annonces.
                </p>
              </div>
            </div>
          ) : existingRequest ? (
            <>
              {existingRequest.status === 'pending' && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <ClockIcon className="w-10 h-10 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">Demande en attente</p>
                    <p className="text-sm text-yellow-700">
                      Votre demande est en cours de traitement. Nous vous contacterons bientôt.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Demandé le {new Date(existingRequest.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}

              {existingRequest.status === 'rejected' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                    <XCircleIcon className="w-10 h-10 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Demande refusée</p>
                      <p className="text-sm text-red-700">
                        Votre demande a été refusée. Vous pouvez soumettre une nouvelle demande.
                      </p>
                    </div>
                  </div>

                  {existingRequest.rejection_reason && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Raison du refus:</p>
                      <p className="text-sm text-gray-600">{existingRequest.rejection_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Non vérifié</p>
                <p className="text-sm text-gray-600">
                  Demandez la vérification pour obtenir un badge sur vos annonces.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Avantages de la vérification */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-etsy-dark mb-4">
            Pourquoi se faire vérifier ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-etsy-dark">Badge vérifié</p>
                <p className="text-sm text-gray-600">
                  Un badge apparaît sur toutes vos annonces
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-etsy-dark">Plus de confiance</p>
                <p className="text-sm text-gray-600">
                  Les acheteurs vous font plus confiance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-etsy-dark">Plus de visibilité</p>
                <p className="text-sm text-gray-600">
                  Vos annonces sont mises en avant
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-etsy-dark">Priorité support</p>
                <p className="text-sm text-gray-600">
                  Assistance prioritaire en cas de problème
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de demande */}
        {!profile?.verified && (!existingRequest || existingRequest.status === 'rejected') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-etsy-dark mb-4">
              Demander la vérification
            </h2>

            <form action={createVerificationRequest} className="space-y-6">
              {/* Nom de l'entreprise */}
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-etsy-dark mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  id="business_name"
                  name="business_name"
                  type="text"
                  required
                  defaultValue={profile?.business_name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                  placeholder="Nom de votre entreprise ou commerce"
                />
              </div>

              {/* Type d'entreprise */}
              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-etsy-dark mb-2">
                  Type d'entreprise
                </label>
                <select
                  id="business_type"
                  name="business_type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Entreprise">Entreprise</option>
                  <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                  <option value="Particulier">Particulier</option>
                  <option value="Coopérative">Coopérative</option>
                  <option value="Association">Association</option>
                </select>
              </div>

              {/* Numéro d'enregistrement */}
              <div>
                <label htmlFor="business_registration" className="block text-sm font-medium text-etsy-dark mb-2">
                  Numéro d'enregistrement (optionnel)
                </label>
                <input
                  id="business_registration"
                  name="business_registration"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                  placeholder="Registre de commerce, patente, etc."
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-etsy-dark mb-2">
                  Téléphone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={profile?.phone || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                  placeholder="+224 XXX XXX XXX"
                />
              </div>

              {/* Ville */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-etsy-dark mb-2">
                  Ville
                </label>
                <select
                  id="city"
                  name="city"
                  defaultValue={profile?.city || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Conakry">Conakry</option>
                  <option value="Nzérékoré">Nzérékoré</option>
                  <option value="Kankan">Kankan</option>
                  <option value="Labé">Labé</option>
                  <option value="Kindia">Kindia</option>
                  <option value="Boké">Boké</option>
                  <option value="Mamou">Mamou</option>
                  <option value="Faranah">Faranah</option>
                </select>
              </div>

              {/* Adresse */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-etsy-dark mb-2">
                  Adresse complète (optionnel)
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                  placeholder="Quartier, rue, immeuble..."
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-etsy-dark mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                  placeholder="Décrivez votre activité et pourquoi vous souhaitez être vérifié..."
                />
              </div>

              {/* Note */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">📌 Note importante</p>
                <p className="text-sm text-blue-700">
                  Votre demande sera examinée par notre équipe dans les 48 heures.
                  Assurez-vous que les informations fournies sont exactes.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Soumettre la demande
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
