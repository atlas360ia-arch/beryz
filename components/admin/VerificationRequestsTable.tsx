'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VerificationRequest, approveVerificationRequest, rejectVerificationRequest } from '@/lib/actions/verification.actions'
import { useToast } from '@/lib/context/ToastContext'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface VerificationRequestsTableProps {
  requests: VerificationRequest[]
}

export default function VerificationRequestsTable({ requests }: VerificationRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleApprove = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette demande ?')) {
      return
    }

    setIsProcessing(true)

    const result = await approveVerificationRequest(requestId)

    if (result.success) {
      showToast('Demande approuvée avec succès', 'success')
      router.refresh()
    } else {
      showToast(result.error || 'Erreur lors de l\'approbation', 'error')
    }

    setIsProcessing(false)
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Veuillez indiquer une raison de refus', 'error')
      return
    }

    setIsProcessing(true)

    const result = await rejectVerificationRequest(requestId, rejectionReason)

    if (result.success) {
      showToast('Demande refusée', 'success')
      setSelectedRequest(null)
      setRejectionReason('')
      router.refresh()
    } else {
      showToast(result.error || 'Erreur lors du refus', 'error')
    }

    setIsProcessing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            <ClockIcon className="w-4 h-4" />
            En attente
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            <CheckCircleIcon className="w-4 h-4" />
            Approuvée
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
            <XCircleIcon className="w-4 h-4" />
            Refusée
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendeur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Téléphone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {request.user_profile?.email || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{request.business_name}</div>
                {request.business_type && (
                  <div className="text-xs text-gray-500">{request.business_type}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.phone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(request.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {request.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={isProcessing}
                      className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request.id)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {requests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune demande de vérification
        </div>
      )}

      {/* Modal de refus */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Refuser la demande de vérification
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Indiquez la raison du refus (visible par le vendeur) :
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder="Ex: Documents manquants, informations incomplètes..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedRequest)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer le refus'}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setRejectionReason('')
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
