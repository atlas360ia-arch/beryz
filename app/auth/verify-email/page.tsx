import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-etsy-secondary-light px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-etsy-success-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Vérifiez votre email
          </h1>
          <p className="text-etsy-dark-light">
            Un email de confirmation a été envoyé à votre adresse email.
          </p>
        </div>

        <div className="bg-etsy-secondary-light p-4 rounded-lg mb-6">
          <p className="text-sm text-etsy-dark">
            Cliquez sur le lien dans l'email pour activer votre compte et commencer à publier des annonces.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Aller à la connexion
          </Link>

          <Link
            href="/"
            className="block w-full text-etsy-dark-light hover:text-etsy-dark font-medium"
          >
            Retour à l'accueil
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-etsy-gray-light">
          <p className="text-sm text-etsy-dark-light">
            Vous n'avez pas reçu l'email ?{' '}
            <button className="text-etsy-primary hover:text-etsy-primary-dark font-semibold">
              Renvoyer
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
