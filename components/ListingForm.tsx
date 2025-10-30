'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import { createListing, updateListing } from '@/lib/actions/listing.actions'
import type { Listing, Category } from '@/types'

interface ListingFormProps {
  listing?: Listing
  categories: Category[]
  mode: 'create' | 'edit'
}

const GUINEA_CITIES = [
  'Conakry',
  'Nzérékoré',
  'Kankan',
  'Labé',
  'Kindia',
  'Boké',
  'Mamou',
  'Faranah',
  'Kissidougou',
  'Guécké dou',
]

export default function ListingForm({ listing, categories, mode }: ListingFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(
    listing?.images ? (Array.isArray(listing.images) ? listing.images : []) : []
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images))

    startTransition(async () => {
      try {
        let result
        if (mode === 'create') {
          result = await createListing(formData)
        } else if (listing) {
          result = await updateListing(listing.id, formData)
        }

        if (result?.success) {
          router.push('/seller/listings')
          router.refresh()
        } else {
          setError(result?.error || 'Une erreur est survenue')
        }
      } catch (e) {
        console.error('Form error:', e)
        setError('Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message d'erreur global */}
      {error && (
        <div className="bg-etsy-error-light text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Titre */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-etsy-dark mb-2">
          Titre de l'annonce *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={listing?.title}
          maxLength={255}
          className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
          placeholder="Ex: Appartement 2 pièces à Conakry"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-etsy-dark mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          defaultValue={listing?.description}
          className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
          placeholder="Décrivez votre annonce en détail..."
        />
        <p className="mt-1 text-xs text-etsy-dark-light">
          Soyez précis et détaillé pour attirer plus d'acheteurs
        </p>
      </div>

      {/* Catégorie et Ville en ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Catégorie */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-etsy-dark mb-2">
            Catégorie *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={listing?.category_id}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="location_city" className="block text-sm font-medium text-etsy-dark mb-2">
            Ville *
          </label>
          <select
            id="location_city"
            name="location_city"
            required
            defaultValue={listing?.location_city}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
          >
            <option value="">Sélectionnez une ville</option>
            {GUINEA_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prix et État en ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prix */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-etsy-dark mb-2">
            Prix (optionnel)
          </label>
          <div className="relative">
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={listing?.price || ''}
              className="w-full px-4 py-2 pr-16 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-etsy-dark-light">GNF</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-etsy-dark-light">
            Laissez vide si le prix est à négocier
          </p>
        </div>

        {/* État */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-etsy-dark mb-2">
            État
          </label>
          <select
            id="condition"
            name="condition"
            defaultValue={listing?.condition || 'good'}
            className="w-full px-4 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-primary focus:border-transparent"
          >
            <option value="new">Neuf</option>
            <option value="excellent">Excellent état</option>
            <option value="good">Bon état</option>
            <option value="fair">État correct</option>
          </select>
        </div>
      </div>

      {/* Upload d'images */}
      <div>
        <label className="block text-sm font-medium text-etsy-dark mb-2">
          Photos (max 5)
        </label>
        <ImageUpload
          maxImages={5}
          onImagesChange={setImages}
          initialImages={images}
        />
        <p className="mt-2 text-xs text-etsy-dark-light">
          La première image sera utilisée comme image principale
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-4 pt-4 border-t border-etsy-gray-light">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="flex-1 bg-etsy-secondary hover:bg-etsy-secondary-dark text-etsy-dark font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-etsy-primary hover:bg-etsy-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? 'Enregistrement...'
            : mode === 'create'
            ? 'Créer l\'annonce'
            : 'Mettre à jour'}
        </button>
      </div>

      {/* Note */}
      <div className="bg-etsy-secondary-light p-4 rounded-lg">
        <p className="text-sm text-etsy-dark-light">
          📝 <strong>Note:</strong> Votre annonce sera enregistrée en brouillon. Vous pourrez
          la publier depuis la page "Mes annonces".
        </p>
      </div>
    </form>
  )
}
