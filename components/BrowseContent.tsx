'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from './SearchBar'
import FiltersSidebar, { FilterValues } from './FiltersSidebar'
import SortOptions from './SortOptions'
import ListingGrid from './ListingGrid'
import { searchListings, SearchParams } from '@/lib/actions/listing.actions'
import { FunnelIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
}

interface BrowseContentProps {
  categories: Category[]
}

export default function BrowseContent({ categories }: BrowseContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // État local pour les filtres et résultats
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Lire les paramètres de l'URL
  const searchQuery = searchParams.get('search') || ''
  const categoryId = searchParams.get('category') || ''
  const city = searchParams.get('city') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const condition = searchParams.get('condition') || ''
  const sortBy = searchParams.get('sort') || 'recent'
  const page = parseInt(searchParams.get('page') || '1', 10)

  // Fonction pour mettre à jour les URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })

      // Reset à la page 1 si les filtres changent
      if (!params.page) {
        newParams.delete('page')
      }

      router.push(`/browse?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // Charger les résultats
  const loadResults = useCallback(async () => {
    setLoading(true)

    const params: SearchParams = {
      search: searchQuery,
      categoryId,
      city,
      minPrice,
      maxPrice,
      condition,
      sortBy,
      page,
      limit: 20,
    }

    const result = await searchListings(params)
    setListings(result.listings)
    setTotalCount(result.count)
    setTotalPages(result.pages)
    setLoading(false)
  }, [searchQuery, categoryId, city, minPrice, maxPrice, condition, sortBy, page])

  // Charger les résultats quand les params changent
  useEffect(() => {
    loadResults()
  }, [loadResults])

  // Handler pour la recherche
  const handleSearch = (query: string) => {
    updateUrlParams({ search: query })
  }

  // Handler pour les filtres
  const handleFilterChange = (filters: FilterValues) => {
    updateUrlParams({
      category: filters.categoryId,
      city: filters.city,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      condition: filters.condition,
    })
  }

  // Handler pour le tri
  const handleSortChange = (sort: string) => {
    updateUrlParams({ sort })
  }

  // Handler pour la pagination
  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage.toString() })
  }

  return (
    <div className="min-h-screen bg-etsy-secondary-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-etsy-dark mb-2">
            Parcourir les annonces
          </h1>
          <p className="text-etsy-dark-light">
            Découvrez les dernières offres en Guinée
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        {/* Layout principal: Sidebar + Contenu */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <FiltersSidebar
              categories={categories}
              onFilterChange={handleFilterChange}
              initialFilters={{
                categoryId,
                city,
                minPrice,
                maxPrice,
                condition,
              }}
            />
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {/* Toolbar: Filtres mobile + Sort + Résultats count */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Bouton filtres mobile */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-etsy-gray rounded-lg hover:bg-etsy-secondary transition-colors"
                >
                  <FunnelIcon className="h-5 w-5 text-etsy-primary" />
                  <span className="font-medium text-etsy-dark">Filtres</span>
                </button>

                {/* Nombre de résultats */}
                <p className="text-sm text-etsy-dark-light">
                  {loading ? (
                    'Chargement...'
                  ) : (
                    <span>
                      <span className="font-semibold text-etsy-dark">
                        {totalCount}
                      </span>{' '}
                      annonce{totalCount > 1 ? 's' : ''} trouvée
                      {totalCount > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>

              {/* Sort options */}
              <SortOptions onSortChange={handleSortChange} currentSort={sortBy} />
            </div>

            {/* Grille d'annonces */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-etsy-primary"></div>
              </div>
            ) : (
              <ListingGrid
                listings={listings}
                emptyMessage="Aucune annonce ne correspond à vos critères. Essayez de modifier vos filtres."
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-white border border-etsy-gray rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-etsy-secondary transition-colors"
                >
                  Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Afficher les pages autour de la page actuelle
                      return (
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 2 && p <= page + 2)
                      )
                    })
                    .map((p, index, array) => {
                      // Afficher "..." si il y a un saut
                      const showEllipsis = index > 0 && p - array[index - 1] > 1
                      return (
                        <div key={p} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-etsy-gray-dark">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              p === page
                                ? 'bg-etsy-primary text-white'
                                : 'bg-white border border-etsy-gray hover:bg-etsy-secondary'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      )
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border border-etsy-gray rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-etsy-secondary transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Sidebar Mobile (Modal) */}
        {showMobileFilters && (
          <FiltersSidebar
            categories={categories}
            onFilterChange={(filters) => {
              handleFilterChange(filters)
              setShowMobileFilters(false)
            }}
            initialFilters={{
              categoryId,
              city,
              minPrice,
              maxPrice,
              condition,
            }}
            isMobile={true}
            onClose={() => setShowMobileFilters(false)}
          />
        )}
      </div>
    </div>
  )
}
