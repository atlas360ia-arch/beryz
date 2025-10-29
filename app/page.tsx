export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-etsy-dark mb-4">
            Bienvenue sur Annonces Guinée
          </h2>
          <p className="text-xl text-etsy-dark-light mb-8">
            Achetez et vendez facilement en Guinée Conakry
          </p>

          <div className="flex gap-4 justify-center">
            <button className="bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Publier une annonce
            </button>
            <button className="bg-white hover:bg-etsy-secondary border-2 border-etsy-primary text-etsy-primary font-semibold px-6 py-3 rounded-lg transition-colors">
              Parcourir les annonces
            </button>
          </div>
        </div>

        {/* Catégories */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-etsy-dark mb-6 text-center">
            Catégories populaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Emploi', 'Immobilier', 'Services', 'Objets'].map((category) => (
              <div
                key={category}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-etsy-gray-light"
              >
                <h4 className="text-xl font-semibold text-etsy-dark">{category}</h4>
                <p className="text-etsy-dark-light mt-2">Voir les annonces</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
