'use client'

import { useState } from 'react'
import type { Contact } from '@/types/database'

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatInterest = (interest: string) => {
    return interest.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleRetrySync = async (contactId: string) => {
    setSyncingId(contactId)
    try {
      const response = await fetch('/api/ghl/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId }),
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      // Reload page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Sync error:', error)
      alert('Error al sincronizar contacto. Intenta de nuevo.')
    } finally {
      setSyncingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'synced') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Synced
        </span>
      )
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          Failed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Pending
      </span>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                GHL Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-white">{contact.full_name}</p>
                    {contact.company && (
                      <p className="text-sm text-white/50">{contact.company}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {contact.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-white/70">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-white/30">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-white/70 capitalize">
                  {formatInterest(contact.interest_type)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contact.ghl_sync_status)}
                    {(contact.ghl_sync_status === 'failed' || contact.ghl_sync_status === 'pending') && (
                      <button
                        onClick={() => handleRetrySync(contact.id)}
                        disabled={syncingId === contact.id}
                        className="text-xs text-white/50 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        {syncingId === contact.id ? 'Sincronizando...' : contact.ghl_sync_status === 'pending' ? 'Sincronizar' : 'Reintentar'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/50">
                  {formatDate(contact.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/10">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4">
            <button
              onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{contact.full_name}</p>
                  <p className="text-sm text-white/50">{contact.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(contact.ghl_sync_status)}
                  <svg
                    className={`w-5 h-5 text-white/40 transition-transform ${
                      expandedId === contact.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {expandedId === contact.id && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                {contact.phone && (
                  <div>
                    <p className="text-xs text-white/40 uppercase">Telefono</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div>
                    <p className="text-xs text-white/40 uppercase">Empresa</p>
                    <p className="text-white">{contact.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/40 uppercase">Interes</p>
                  <p className="text-white capitalize">
                    {formatInterest(contact.interest_type)}
                  </p>
                </div>
                {contact.message && (
                  <div>
                    <p className="text-xs text-white/40 uppercase">Mensaje</p>
                    <p className="text-white">{contact.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-white/40 uppercase">Fecha</p>
                  <p className="text-white">{formatDate(contact.created_at)}</p>
                </div>

                {(contact.ghl_sync_status === 'failed' || contact.ghl_sync_status === 'pending') && (
                  <button
                    onClick={() => handleRetrySync(contact.id)}
                    disabled={syncingId === contact.id}
                    className="
                      w-full py-2.5 px-4
                      bg-white/10 backdrop-blur-md
                      border border-white/20
                      text-white
                      rounded-2xl text-sm font-medium
                      hover:bg-white/20
                      disabled:opacity-50
                      transition-all duration-200
                    "
                  >
                    {syncingId === contact.id ? 'Sincronizando...' : contact.ghl_sync_status === 'pending' ? 'Sincronizar a GHL Ahora' : 'Reintentar Sincronizacion GHL'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
