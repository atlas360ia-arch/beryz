'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ModerationFilters from './ModerationFilters'
import ListingTable from './ListingTable'

interface ModerationContentProps {
  initialListings: any[]
  initialTotal: number
  initialPages: number
  initialPage: number
  categories: Array<{ id: string; name: string }>
}

export default function ModerationContent({
  initialListings,
  initialTotal,
  initialPages,
  initialPage,
  categories,
}: ModerationContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [listings, setListings] = useState(initialListings)
  const [total, setTotal] = useState(initialTotal)
  const [pages, setPages] = useState(initialPages)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)

  const handleFilterChange = useCallback(
    (filters: { status: string; categoryId: string; search: string }) => {
      setIsLoading(true)

      // Build URL params
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.categoryId) params.set('category', filters.categoryId)
      if (filters.search) params.set('search', filters.search)
      params.set('page', '1') // Reset to page 1

      // Navigate with new params
      router.push(`/admin/moderation?${params.toString()}`)
    },
    [router]
  )

  const handlePageChange = (page: number) => {
    setIsLoading(true)

    // Build URL params with new page
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())

    router.push(`/admin/moderation?${params.toString()}`)
  }

  return (
    <div>
      <ModerationFilters
        onFilterChange={handleFilterChange}
        categories={categories}
        initialFilters={{
          status: searchParams.get('status') || 'all',
          categoryId: searchParams.get('category') || '',
          search: searchParams.get('search') || '',
        }}
      />

      {/* Results summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-etsy-dark-light">
          {total} {total > 1 ? 'annonces trouvées' : 'annonce trouvée'}
        </p>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="h-8 bg-etsy-gray-light rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-etsy-gray-light rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Listings table */}
      {!isLoading && <ListingTable listings={listings} />}

      {/* Pagination */}
      {!isLoading && pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-etsy-gray rounded-lg text-sm font-medium text-etsy-dark hover:bg-etsy-gray-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <div className="flex gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === pages ||
                (page >= currentPage - 1 && page <= currentPage + 1)

              if (!showPage && page === 2) {
                return (
                  <span key={page} className="px-2 text-etsy-dark-light">
                    ...
                  </span>
                )
              }

              if (!showPage && page === pages - 1) {
                return (
                  <span key={page} className="px-2 text-etsy-dark-light">
                    ...
                  </span>
                )
              }

              if (!showPage) return null

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    page === currentPage
                      ? 'bg-etsy-primary text-white'
                      : 'border border-etsy-gray text-etsy-dark hover:bg-etsy-gray-light'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pages}
            className="px-4 py-2 border border-etsy-gray rounded-lg text-sm font-medium text-etsy-dark hover:bg-etsy-gray-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}
