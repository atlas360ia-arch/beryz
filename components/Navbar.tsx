import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth.actions'

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="bg-white shadow-sm border-b border-etsy-gray-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-etsy-primary">
              Beryz
            </h1>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {/* Lien parcourir */}
            <Link
              href="/browse"
              className="text-etsy-dark hover:text-etsy-primary font-medium transition-colors"
            >
              Parcourir
            </Link>

            {user ? (
              <>
                {/* Liens utilisateur connecté */}
                <Link
                  href="/seller/listings"
                  className="text-etsy-dark hover:text-etsy-primary font-medium transition-colors"
                >
                  Mes annonces
                </Link>

                <Link
                  href="/seller/messages"
                  className="text-etsy-dark hover:text-etsy-primary font-medium transition-colors"
                >
                  Messages
                </Link>

                {/* Bouton publier */}
                <Link
                  href="/seller/listings/create"
                  className="bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Publier
                </Link>

                {/* Menu utilisateur */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-etsy-dark hover:text-etsy-primary">
                    <div className="w-8 h-8 bg-etsy-gray rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-etsy-gray-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <Link
                        href="/seller/profile"
                        className="block px-4 py-2 text-etsy-dark hover:bg-etsy-secondary-light transition-colors"
                      >
                        Mon profil
                      </Link>
                      <Link
                        href="/seller/favorites"
                        className="block px-4 py-2 text-etsy-dark hover:bg-etsy-secondary-light transition-colors"
                      >
                        Mes favoris
                      </Link>
                      <div className="border-t border-etsy-gray-light my-2"></div>
                      <form action={logout}>
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-2 text-etsy-error hover:bg-etsy-secondary-light transition-colors"
                        >
                          Déconnexion
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Liens utilisateur non connecté */}
                <Link
                  href="/auth/login"
                  className="text-etsy-dark hover:text-etsy-primary font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
