'use client'

import { BarsArrowDownIcon } from '@heroicons/react/24/outline'

interface SortOptionsProps {
  onSortChange: (sortBy: string) => void
  currentSort?: string
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'popular', label: 'Plus populaire' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' }
]

export default function SortOptions({
  onSortChange,
  currentSort = 'recent'
}: SortOptionsProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-etsy-dark">
        <BarsArrowDownIcon className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline">Trier par:</span>
      </div>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border border-etsy-gray rounded-lg bg-white text-etsy-dark focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
