'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ModerationFiltersProps {
  onFilterChange: (filters: {
    status: string
    categoryId: string
    search: string
  }) => void
  categories: Array<{ id: string; name: string }>
  initialFilters?: {
    status?: string
    categoryId?: string
    search?: string
  }
}

export default function ModerationFilters({
  onFilterChange,
  categories,
  initialFilters,
}: ModerationFiltersProps) {
  const [status, setStatus] = useState(initialFilters?.status || 'all')
  const [categoryId, setCategoryId] = useState(initialFilters?.categoryId || '')
  const [search, setSearch] = useState(initialFilters?.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ status, categoryId, search })
    }, 500)

    return () => clearTimeout(timer)
  }, [status, categoryId, search, onFilterChange])

  const handleClearFilters = () => {
    setStatus('all')
    setCategoryId('')
    setSearch('')
  }

  const hasActiveFilters =
    status !== 'all' || categoryId !== '' || search !== ''

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-etsy-dark">Filtres</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-etsy-primary hover:text-etsy-primary-dark font-medium flex items-center gap-1"
          >
            <XMarkIcon className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Rechercher
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-etsy-dark-light" />
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Titre ou description..."
              className="w-full pl-10 pr-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-etsy-dark-light hover:text-etsy-dark"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Statut
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Catégorie
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent bg-white"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
