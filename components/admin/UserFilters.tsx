'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface UserFiltersProps {
  onFilterChange: (filters: {
    search: string
    role: string
    banned: string
    verified: string
  }) => void
  initialFilters?: {
    search?: string
    role?: string
    banned?: string
    verified?: string
  }
}

export default function UserFilters({
  onFilterChange,
  initialFilters,
}: UserFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search || '')
  const [role, setRole] = useState(initialFilters?.role || 'all')
  const [banned, setBanned] = useState(initialFilters?.banned || 'all')
  const [verified, setVerified] = useState(initialFilters?.verified || 'all')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, role, banned, verified })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, role, banned, verified, onFilterChange])

  const handleClearFilters = () => {
    setSearch('')
    setRole('all')
    setBanned('all')
    setVerified('all')
  }

  const hasActiveFilters =
    search !== '' ||
    role !== 'all' ||
    banned !== 'all' ||
    verified !== 'all'

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Nom d'utilisateur..."
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

        {/* Role Filter */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Rôle
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent bg-white"
          >
            <option value="all">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Banned Filter */}
        <div>
          <label
            htmlFor="banned"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Statut
          </label>
          <select
            id="banned"
            value={banned}
            onChange={(e) => setBanned(e.target.value)}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent bg-white"
          >
            <option value="all">Tous</option>
            <option value="active">Actif</option>
            <option value="banned">Banni</option>
          </select>
        </div>

        {/* Verified Filter */}
        <div>
          <label
            htmlFor="verified"
            className="block text-sm font-medium text-etsy-dark mb-2"
          >
            Vérification
          </label>
          <select
            id="verified"
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent bg-white"
          >
            <option value="all">Tous</option>
            <option value="verified">Vérifié</option>
            <option value="not_verified">Non vérifié</option>
          </select>
        </div>
      </div>
    </div>
  )
}
