'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  FlagIcon,
} from '@heroicons/react/24/outline'
import {
  approveListing,
  rejectListing,
  deleteListing,
  flagListing,
} from '@/lib/actions/moderation.actions'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/lib/context/ToastContext'

interface Listing {
  id: string
  title: string
  price: number
  status: string
  images: string[]
  created_at: string
  category?: { name: string }
  seller_profile?: {
    business_name: string
    city: string
    verified: boolean
  }
}

interface ListingTableProps {
  listings: Listing[]
}

export default function ListingTable({ listings }: ListingTableProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | 'delete' | 'flag'
    listingId: string
    listingTitle: string
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [flagDetails, setFlagDetails] = useState('')

  const handleApprove = async (listingId: string) => {
    startTransition(async () => {
      const result = await approveListing(listingId)
      if (result.success) {
        addToast('success', 'Annonce approuvée avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors de l\'approbation')
      }
      setConfirmDialog(null)
    })
  }

  const handleReject = async (listingId: string) => {
    startTransition(async () => {
      const result = await rejectListing(listingId, rejectReason)
      if (result.success) {
        addToast('success', 'Annonce rejetée avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors du rejet')
      }
      setConfirmDialog(null)
      setRejectReason('')
    })
  }

  const handleDelete = async (listingId: string) => {
    startTransition(async () => {
      const result = await deleteListing(listingId)
      if (result.success) {
        addToast('success', 'Annonce supprimée avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors de la suppression')
      }
      setConfirmDialog(null)
    })
  }

  const handleFlag = async (listingId: string) => {
    if (!flagReason) {
      addToast('error', 'Veuillez sélectionner une raison')
      return
    }

    startTransition(async () => {
      const result = await flagListing(listingId, flagReason, flagDetails)
      if (result.success) {
        addToast('success', 'Annonce signalée et dépubliée')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors du signalement')
      }
      setConfirmDialog(null)
      setFlagReason('')
      setFlagDetails('')
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fade-in">
        <p className="text-etsy-dark-light">
          Aucune annonce trouvée avec ces filtres
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-etsy-gray-light">
            <thead className="bg-etsy-secondary-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-etsy-gray-light">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-etsy-secondary-light">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-etsy-gray">
                        {listing.images && listing.images[0] ? (
                          <Image
                            src={listing.images[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-etsy-dark-light">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="max-w-xs">
                        <Link
                          href={`/listing/${listing.id}`}
                          className="text-sm font-medium text-etsy-dark hover:text-etsy-primary line-clamp-2"
                        >
                          {listing.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-etsy-dark">
                      {listing.seller_profile?.business_name || 'Inconnu'}
                    </div>
                    <div className="text-xs text-etsy-dark-light">
                      {listing.seller_profile?.city || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-etsy-dark">
                      {listing.category?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-etsy-dark">
                      {formatPrice(listing.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        listing.status === 'published'
                          ? 'bg-etsy-success/10 text-etsy-success'
                          : 'bg-etsy-gray-light text-etsy-dark-light'
                      }`}
                    >
                      {listing.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-etsy-dark-light">
                    {formatDate(listing.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <Link
                        href={`/listing/${listing.id}`}
                        className="text-etsy-dark-light hover:text-etsy-dark p-1 rounded hover:bg-etsy-gray-light"
                        title="Voir"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>

                      {/* Approve (only for draft) */}
                      {listing.status === 'draft' && (
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: 'approve',
                              listingId: listing.id,
                              listingTitle: listing.title,
                            })
                          }
                          className="text-etsy-success hover:text-etsy-success/80 p-1 rounded hover:bg-etsy-success/10"
                          title="Approuver"
                          disabled={isPending}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Reject (only for published) */}
                      {listing.status === 'published' && (
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: 'reject',
                              listingId: listing.id,
                              listingTitle: listing.title,
                            })
                          }
                          className="text-etsy-warning hover:text-etsy-warning/80 p-1 rounded hover:bg-etsy-warning/10"
                          title="Rejeter"
                          disabled={isPending}
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Flag */}
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            type: 'flag',
                            listingId: listing.id,
                            listingTitle: listing.title,
                          })
                        }
                        className="text-etsy-warning hover:text-etsy-warning/80 p-1 rounded hover:bg-etsy-warning/10"
                        title="Signaler"
                        disabled={isPending}
                      >
                        <FlagIcon className="h-5 w-5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            isOpen: true,
                            type: 'delete',
                            listingId: listing.id,
                            listingTitle: listing.title,
                          })
                        }
                        className="text-etsy-error hover:text-etsy-error/80 p-1 rounded hover:bg-etsy-error/10"
                        title="Supprimer"
                        disabled={isPending}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialogs */}
      {confirmDialog?.type === 'approve' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleApprove(confirmDialog.listingId)}
          title="Approuver l'annonce"
          description={`Êtes-vous sûr de vouloir approuver "${confirmDialog.listingTitle}" ? L'annonce sera publiée.`}
          confirmLabel="Approuver"
          variant="info"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'reject' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => {
            setConfirmDialog(null)
            setRejectReason('')
          }}
          onConfirm={() => handleReject(confirmDialog.listingId)}
          title="Rejeter l'annonce"
          description={
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir rejeter "{confirmDialog.listingTitle}"
                ? L&apos;annonce sera mise en brouillon.
              </p>
              <div>
                <label
                  htmlFor="reject-reason"
                  className="block text-sm font-medium text-etsy-dark mb-1"
                >
                  Raison (optionnelle)
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Pourquoi cette annonce est-elle rejetée ?"
                  className="w-full px-3 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-warning resize-none"
                  rows={3}
                />
              </div>
            </div>
          }
          confirmLabel="Rejeter"
          variant="warning"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'delete' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleDelete(confirmDialog.listingId)}
          title="Supprimer l'annonce"
          description={`Êtes-vous sûr de vouloir supprimer définitivement "${confirmDialog.listingTitle}" ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          variant="danger"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'flag' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => {
            setConfirmDialog(null)
            setFlagReason('')
            setFlagDetails('')
          }}
          onConfirm={() => handleFlag(confirmDialog.listingId)}
          title="Signaler l'annonce"
          description={
            <div className="space-y-3">
              <p>
                Signaler "{confirmDialog.listingTitle}" pour examen.
                L&apos;annonce sera immédiatement dépubliée.
              </p>
              <div>
                <label
                  htmlFor="flag-reason"
                  className="block text-sm font-medium text-etsy-dark mb-1"
                >
                  Raison *
                </label>
                <select
                  id="flag-reason"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full px-3 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-warning"
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="spam">Spam</option>
                  <option value="fraud">Fraude suspectée</option>
                  <option value="duplicate">Annonce en double</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="flag-details"
                  className="block text-sm font-medium text-etsy-dark mb-1"
                >
                  Détails (optionnel)
                </label>
                <textarea
                  id="flag-details"
                  value={flagDetails}
                  onChange={(e) => setFlagDetails(e.target.value)}
                  placeholder="Informations complémentaires..."
                  className="w-full px-3 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-warning resize-none"
                  rows={3}
                />
              </div>
            </div>
          }
          confirmLabel="Signaler"
          variant="warning"
          loading={isPending}
        />
      )}
    </>
  )
}
