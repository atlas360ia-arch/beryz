'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Rechercher des annonces...',
  initialValue = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  // Debounce la recherche (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-etsy-gray-dark" />
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 border border-etsy-gray rounded-full focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent text-etsy-dark placeholder-etsy-gray-dark"
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-etsy-gray-dark hover:text-etsy-dark transition-colors"
          aria-label="Effacer la recherche"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
