import Link from 'next/link'
import { signup } from '@/lib/actions/auth.actions'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-etsy-secondary-light px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Inscription
          </h1>
          <p className="text-etsy-dark-light">
            Créez votre compte vendeur gratuitement
          </p>
        </div>

        <form action={signup} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-etsy-dark mb-2"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-etsy-dark mb-2"
            >
              Mot de passe *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              placeholder="Minimum 6 caractères"
            />
            <p className="mt-1 text-xs text-etsy-dark-light">
              Au moins 6 caractères
            </p>
          </div>

          {/* Nom de l'entreprise (optionnel) */}
          <div>
            <label
              htmlFor="business_name"
              className="block text-sm font-medium text-etsy-dark mb-2"
            >
              Nom de l'entreprise (optionnel)
            </label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              placeholder="Votre entreprise"
            />
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            className="w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Créer mon compte
          </button>

          {/* Lien vers connexion */}
          <div className="text-center text-sm text-etsy-dark-light">
            Vous avez déjà un compte ?{' '}
            <Link
              href="/auth/login"
              className="text-etsy-primary hover:text-etsy-primary-dark font-semibold"
            >
              Se connecter
            </Link>
          </div>

          {/* Conditions */}
          <p className="text-xs text-etsy-dark-light text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/legal/terms" className="text-etsy-primary hover:underline">
              Conditions d'utilisation
            </Link>
          </p>
        </form>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-etsy-dark-light hover:text-etsy-dark"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
