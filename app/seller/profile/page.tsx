import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateSellerProfile } from '@/lib/actions/auth.actions'

export default async function SellerProfilePage() {
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

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Mon profil vendeur
          </h1>
          <p className="text-etsy-dark-light">
            Gérez vos informations publiques
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form action={updateSellerProfile} className="space-y-6">
            {/* Email (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-etsy-dark mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg bg-etsy-secondary-light text-etsy-dark-light"
              />
              <p className="mt-1 text-xs text-etsy-dark-light">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Nom de l'entreprise */}
            <div>
              <label
                htmlFor="business_name"
                className="block text-sm font-medium text-etsy-dark mb-2"
              >
                Nom de l'entreprise
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                defaultValue={profile?.business_name || ''}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                placeholder="Nom de votre entreprise"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-etsy-dark mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={profile?.description || ''}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                placeholder="Décrivez votre activité..."
              />
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-etsy-dark mb-2"
              >
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ''}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                placeholder="+224 XXX XXX XXX"
              />
            </div>

            {/* Ville */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-etsy-dark mb-2"
              >
                Ville
              </label>
              <select
                id="city"
                name="city"
                defaultValue={profile?.city || ''}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              >
                <option value="">Sélectionnez une ville</option>
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

            {/* Informations supplémentaires */}
            <div className="bg-etsy-secondary-light p-4 rounded-lg">
              <h3 className="font-semibold text-etsy-dark mb-2">
                Informations du profil
              </h3>
              <div className="space-y-1 text-sm text-etsy-dark-light">
                <p>Note: {profile?.rating?.toFixed(1) || '5.0'} / 5.0</p>
                <p>
                  Statut:{' '}
                  {profile?.verified ? (
                    <span className="text-etsy-success font-semibold">
                      Vérifié
                    </span>
                  ) : (
                    <span className="text-etsy-gray-dark">Non vérifié</span>
                  )}
                </p>
                <p>
                  Membre depuis:{' '}
                  {new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
