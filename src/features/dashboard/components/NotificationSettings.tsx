'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'

interface NotificationSettingsProps {
  profile: Profile | null
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    notify_new_contact: profile?.notify_new_contact ?? true,
    notify_ghl_sync_fail: profile?.notify_ghl_sync_fail ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Notificaciones por Correo</h2>
        <p className="text-sm text-white/50 mt-1">
          Elige que correos quieres recibir
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm text-emerald-300">Ajustes guardados exitosamente!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            id="notify_new_contact"
            name="notify_new_contact"
            type="checkbox"
            checked={formData.notify_new_contact}
            onChange={handleChange}
            className="
              w-5 h-5 mt-0.5
              rounded
              border-white/30 bg-white/10
              text-white
              focus:ring-white/30
            "
          />
          <div>
            <label htmlFor="notify_new_contact" className="text-sm font-medium text-white">
              Notificaciones de Nuevos Contactos
            </label>
            <p className="text-sm text-white/50">
              Recibe una notificacion cuando alguien comparta su informacion de contacto contigo
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="notify_ghl_sync_fail"
            name="notify_ghl_sync_fail"
            type="checkbox"
            checked={formData.notify_ghl_sync_fail}
            onChange={handleChange}
            className="
              w-5 h-5 mt-0.5
              rounded
              border-white/30 bg-white/10
              text-white
              focus:ring-white/30
            "
          />
          <div>
            <label htmlFor="notify_ghl_sync_fail" className="text-sm font-medium text-white">
              Alertas de Fallo de Sincronizacion GHL
            </label>
            <p className="text-sm text-white/50">
              Recibe una notificacion cuando un contacto falle al sincronizar con GoHighLevel
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="
              px-6 py-3
              bg-white/10 backdrop-blur-md
              border border-white/20
              text-white
              rounded-2xl font-medium
              hover:bg-white/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? 'Guardando...' : 'Guardar Ajustes'}
          </button>
        </div>
      </form>
    </div>
  )
}
