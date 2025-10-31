'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import {
  banUser,
  unbanUser,
  changeUserRole,
  toggleVerified,
  deleteUser,
} from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/lib/context/ToastContext'

interface User {
  user_id: string
  business_name: string
  role: string
  verified: boolean
  banned: boolean
  banned_reason?: string
  banned_at?: string
  city?: string
  rating: number
  created_at: string
  auth_user?: Array<{
    email: string
    created_at: string
  }>
}

interface UserTableProps {
  users: User[]
}

export default function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'ban' | 'unban' | 'promote' | 'demote' | 'verify' | 'unverify' | 'delete'
    userId: string
    userName: string
  } | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banDetails, setBanDetails] = useState('')

  const handleBan = async (userId: string) => {
    if (!banReason) {
      addToast('error', 'Veuillez sélectionner une raison')
      return
    }

    startTransition(async () => {
      const result = await banUser(userId, banReason, banDetails)
      if (result.success) {
        addToast('success', 'Utilisateur banni avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors du bannissement')
      }
      setConfirmDialog(null)
      setBanReason('')
      setBanDetails('')
    })
  }

  const handleUnban = async (userId: string) => {
    startTransition(async () => {
      const result = await unbanUser(userId)
      if (result.success) {
        addToast('success', 'Utilisateur débanni avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors du débannissement')
      }
      setConfirmDialog(null)
    })
  }

  const handleChangeRole = async (userId: string, newRole: 'user' | 'admin') => {
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole)
      if (result.success) {
        addToast('success', `Rôle changé en ${newRole}`)
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors du changement de rôle')
      }
      setConfirmDialog(null)
    })
  }

  const handleToggleVerified = async (userId: string, verified: boolean) => {
    startTransition(async () => {
      const result = await toggleVerified(userId, verified)
      if (result.success) {
        addToast(
          'success',
          verified ? 'Utilisateur vérifié' : 'Vérification retirée'
        )
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur')
      }
      setConfirmDialog(null)
    })
  }

  const handleDelete = async (userId: string) => {
    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.success) {
        addToast('success', 'Utilisateur supprimé avec succès')
        router.refresh()
      } else {
        addToast('error', result.error || 'Erreur lors de la suppression')
      }
      setConfirmDialog(null)
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fade-in">
        <p className="text-etsy-dark-light">
          Aucun utilisateur trouvé avec ces filtres
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
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-etsy-dark uppercase tracking-wider">
                  Ville
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
              {users.map((user) => {
                const email = user.auth_user?.[0]?.email || 'N/A'

                return (
                  <tr
                    key={user.user_id}
                    className={`hover:bg-etsy-secondary-light ${
                      user.banned ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-etsy-dark flex items-center gap-2">
                            {user.business_name || 'Sans nom'}
                            {user.verified && (
                              <CheckBadgeIcon
                                className="h-5 w-5 text-etsy-success"
                                title="Vérifié"
                              />
                            )}
                          </div>
                          <div className="text-xs text-etsy-dark-light">
                            Note: {user.rating.toFixed(1)}/5
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-etsy-dark">{email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-etsy-gold/10 text-etsy-gold'
                            : 'bg-etsy-gray-light text-etsy-dark'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.banned ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-etsy-error/10 text-etsy-error">
                          Banni
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-etsy-success/10 text-etsy-success">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-etsy-dark">
                      {user.city || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-etsy-dark-light">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Verify/Unverify */}
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: user.verified ? 'unverify' : 'verify',
                              userId: user.user_id,
                              userName: user.business_name,
                            })
                          }
                          className={`p-1 rounded hover:bg-etsy-gray-light ${
                            user.verified
                              ? 'text-etsy-success hover:text-etsy-success/80'
                              : 'text-etsy-dark-light hover:text-etsy-dark'
                          }`}
                          title={user.verified ? 'Retirer vérification' : 'Vérifier'}
                          disabled={isPending}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>

                        {/* Promote/Demote */}
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: user.role === 'admin' ? 'demote' : 'promote',
                              userId: user.user_id,
                              userName: user.business_name,
                            })
                          }
                          className={`p-1 rounded hover:bg-etsy-gray-light ${
                            user.role === 'admin'
                              ? 'text-etsy-gold hover:text-etsy-gold/80'
                              : 'text-etsy-dark-light hover:text-etsy-dark'
                          }`}
                          title={
                            user.role === 'admin'
                              ? 'Retirer admin'
                              : 'Promouvoir admin'
                          }
                          disabled={isPending}
                        >
                          {user.role === 'admin' ? (
                            <ShieldExclamationIcon className="h-5 w-5" />
                          ) : (
                            <ShieldCheckIcon className="h-5 w-5" />
                          )}
                        </button>

                        {/* Ban/Unban */}
                        {user.banned ? (
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'unban',
                                userId: user.user_id,
                                userName: user.business_name,
                              })
                            }
                            className="text-etsy-success hover:text-etsy-success/80 p-1 rounded hover:bg-etsy-success/10"
                            title="Débannir"
                            disabled={isPending}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: 'ban',
                                userId: user.user_id,
                                userName: user.business_name,
                              })
                            }
                            className="text-etsy-error hover:text-etsy-error/80 p-1 rounded hover:bg-etsy-error/10"
                            title="Bannir"
                            disabled={isPending}
                          >
                            <NoSymbolIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              isOpen: true,
                              type: 'delete',
                              userId: user.user_id,
                              userName: user.business_name,
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialogs */}
      {confirmDialog?.type === 'ban' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => {
            setConfirmDialog(null)
            setBanReason('')
            setBanDetails('')
          }}
          onConfirm={() => handleBan(confirmDialog.userId)}
          title="Bannir l'utilisateur"
          description={
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir bannir "{confirmDialog.userName}" ?
                L&apos;utilisateur ne pourra plus se connecter.
              </p>
              <div>
                <label
                  htmlFor="ban-reason"
                  className="block text-sm font-medium text-etsy-dark mb-1"
                >
                  Raison *
                </label>
                <select
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-error"
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="spam">Spam</option>
                  <option value="fraud">Fraude</option>
                  <option value="abuse">Abus</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="ban-details"
                  className="block text-sm font-medium text-etsy-dark mb-1"
                >
                  Détails (optionnel)
                </label>
                <textarea
                  id="ban-details"
                  value={banDetails}
                  onChange={(e) => setBanDetails(e.target.value)}
                  placeholder="Informations complémentaires..."
                  className="w-full px-3 py-2 border border-etsy-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-etsy-error resize-none"
                  rows={3}
                />
              </div>
            </div>
          }
          confirmLabel="Bannir"
          variant="danger"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'unban' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleUnban(confirmDialog.userId)}
          title="Débannir l'utilisateur"
          description={`Êtes-vous sûr de vouloir débannir "${confirmDialog.userName}" ? L'utilisateur pourra à nouveau se connecter.`}
          confirmLabel="Débannir"
          variant="info"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'promote' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleChangeRole(confirmDialog.userId, 'admin')}
          title="Promouvoir en admin"
          description={`Êtes-vous sûr de vouloir promouvoir "${confirmDialog.userName}" en administrateur ? Cette personne aura accès au panneau d'administration.`}
          confirmLabel="Promouvoir"
          variant="warning"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'demote' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleChangeRole(confirmDialog.userId, 'user')}
          title="Retirer le rôle admin"
          description={`Êtes-vous sûr de vouloir retirer le rôle admin de "${confirmDialog.userName}" ? Cette personne n'aura plus accès au panneau d'administration.`}
          confirmLabel="Rétrograder"
          variant="warning"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'verify' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleToggleVerified(confirmDialog.userId, true)}
          title="Vérifier l'utilisateur"
          description={`Êtes-vous sûr de vouloir vérifier "${confirmDialog.userName}" ? Un badge de vérification sera affiché sur son profil.`}
          confirmLabel="Vérifier"
          variant="info"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'unverify' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleToggleVerified(confirmDialog.userId, false)}
          title="Retirer la vérification"
          description={`Êtes-vous sûr de vouloir retirer la vérification de "${confirmDialog.userName}" ?`}
          confirmLabel="Retirer"
          variant="warning"
          loading={isPending}
        />
      )}

      {confirmDialog?.type === 'delete' && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(null)}
          onConfirm={() => handleDelete(confirmDialog.userId)}
          title="Supprimer l'utilisateur"
          description={`Êtes-vous sûr de vouloir supprimer définitivement "${confirmDialog.userName}" ? Toutes ses annonces, messages et données seront supprimés. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          variant="danger"
          loading={isPending}
        />
      )}
    </>
  )
}
