'use client'

import { useState } from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
}

interface FiltersSidebarProps {
  categories: Category[]
  onFilterChange: (filters: FilterValues) => void
  initialFilters?: FilterValues
  isMobile?: boolean
  onClose?: () => void
}

export interface FilterValues {
  categoryId: string
  city: string
  minPrice: string
  maxPrice: string
  condition: string
}

const GUINEA_CITIES = [
  'Conakry',
  'Kankan',
  'Labé',
  'Kindia',
  'Boké',
  'Mamou',
  'Nzérékoré',
  'Siguiri',
  'Kamsar',
  'Dubréka'
]

const CONDITIONS = [
  { value: 'new', label: 'Neuf' },
  { value: 'excellent', label: 'Excellent état' },
  { value: 'good', label: 'Bon état' },
  { value: 'fair', label: 'État correct' }
]

export default function FiltersSidebar({
  categories,
  onFilterChange,
  initialFilters,
  isMobile = false,
  onClose
}: FiltersSidebarProps) {
  const [filters, setFilters] = useState<FilterValues>(
    initialFilters || {
      categoryId: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    }
  )

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      categoryId: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters =
    filters.categoryId ||
    filters.city ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.condition

  return (
    <div
      className={`bg-white ${
        isMobile
          ? 'fixed inset-0 z-50 overflow-y-auto'
          : 'rounded-lg border border-etsy-gray p-6'
      }`}
    >
      {/* Header Mobile */}
      {isMobile && (
        <div className="sticky top-0 bg-white border-b border-etsy-gray px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-6 w-6 text-etsy-primary" />
            <h2 className="text-xl font-semibold text-etsy-dark">Filtres</h2>
          </div>
          <button
            onClick={onClose}
            className="text-etsy-gray-dark hover:text-etsy-dark"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      <div className={isMobile ? 'px-6 py-6' : ''}>
        {/* Header Desktop */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-etsy-primary" />
              <h2 className="text-lg font-semibold text-etsy-dark">Filtres</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-etsy-primary hover:text-etsy-primary-dark"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-etsy-dark mb-2">
              Catégorie
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-etsy-dark mb-2">
              Localisation
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
            >
              <option value="">Toutes les villes</option>
              {GUINEA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-etsy-dark mb-2">
              Prix (GNF)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                min="0"
              />
              <span className="text-etsy-gray-dark">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-etsy-dark mb-2">
              État
            </label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
            >
              <option value="">Tous les états</option>
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons Mobile */}
        {isMobile && (
          <div className="mt-8 space-y-3">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="w-full px-6 py-3 bg-white border border-etsy-gray rounded-lg text-etsy-dark font-medium hover:bg-etsy-secondary transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-etsy-primary text-white rounded-lg font-medium hover:bg-etsy-primary-dark transition-colors"
            >
              Voir les résultats
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
