'use client'

import { useState, useCallback } from 'react'
import { uploadListingImage } from '@/lib/actions/listing.actions'

interface ImageUploadProps {
  maxImages?: number
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
}

export default function ImageUpload({
  maxImages = 5,
  onImagesChange,
  initialImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Vérifier le nombre max d'images
    if (images.length + files.length > maxImages) {
      setError(`Vous ne pouvez ajouter que ${maxImages} images maximum`)
      return
    }

    setUploading(true)
    setError(null)

    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Créer FormData pour l'upload
      const formData = new FormData()
      formData.append('file', file)

      try {
        const result = await uploadListingImage(formData)

        if (result.success && result.data) {
          newImages.push(result.data.url)
        } else {
          setError(result.error || 'Erreur lors de l\'upload')
        }
      } catch (e) {
        console.error('Upload error:', e)
        setError('Erreur lors de l\'upload de l\'image')
      }
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onImagesChange(updatedImages)
    setUploading(false)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [images, maxImages])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-etsy-primary bg-etsy-secondary-light'
            : 'border-etsy-gray hover:border-etsy-primary'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-etsy-gray-dark mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {uploading ? (
            <p className="text-etsy-dark-light">Upload en cours...</p>
          ) : (
            <>
              <p className="text-etsy-dark font-medium mb-1">
                Cliquez pour sélectionner ou glissez-déposez
              </p>
              <p className="text-sm text-etsy-dark-light">
                JPG, PNG, WEBP (max 5MB par image)
              </p>
              <p className="text-xs text-etsy-dark-light mt-2">
                {images.length} / {maxImages} images
              </p>
            </>
          )}
        </label>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-etsy-error-light text-white p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Prévisualisation des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-etsy-gray-light"
              />

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-etsy-error hover:bg-etsy-error-dark text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Badge image principale */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-etsy-primary text-white text-xs px-2 py-1 rounded">
                  Principale
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
