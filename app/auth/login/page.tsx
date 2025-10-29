import Link from 'next/link'
import { login } from '@/lib/actions/auth.actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-etsy-secondary-light px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Connexion
          </h1>
          <p className="text-etsy-dark-light">
            Connectez-vous à votre compte
          </p>
        </div>

        <form action={login} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-etsy-dark mb-2"
            >
              Email
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
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Se connecter
          </button>

          {/* Lien vers inscription */}
          <div className="text-center text-sm text-etsy-dark-light">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/signup"
              className="text-etsy-primary hover:text-etsy-primary-dark font-semibold"
            >
              S'inscrire
            </Link>
          </div>
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
