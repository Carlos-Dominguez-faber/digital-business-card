'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'

interface GHLSettingsProps {
  profile: Profile | null
}

export function GHLSettings({ profile }: GHLSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isConnected, setIsConnected] = useState(profile?.ghl_connected ?? false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debug: Log what profile data we receive
  console.log('=== GHLSettings Component ===')
  console.log('Profile received:', profile ? 'yes' : 'no')
  console.log('GHL API Key from profile:', profile?.ghl_api_key ? 'exists (masked)' : 'empty/null')
  console.log('GHL Location ID from profile:', profile?.ghl_location_id)
  console.log('GHL Connected from profile:', profile?.ghl_connected)

  const [formData, setFormData] = useState({
    ghl_api_key: profile?.ghl_api_key || '',
    ghl_location_id: profile?.ghl_location_id || '',
    ghl_auto_sync: profile?.ghl_auto_sync ?? true,
  })

  const testConnection = async (): Promise<boolean> => {
    if (!formData.ghl_api_key || !formData.ghl_location_id) {
      return false
    }

    try {
      const response = await fetch('/api/settings/ghl/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghl_api_key: formData.ghl_api_key,
          ghl_location_id: formData.ghl_location_id,
        }),
      })

      return response.ok
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setTestResult(null)

    try {
      // First test the connection if credentials are provided
      let connectionVerified = false
      if (formData.ghl_api_key && formData.ghl_location_id) {
        connectionVerified = await testConnection()
        if (!connectionVerified) {
          setTestResult({ success: false, message: 'Conexion fallida. Verifica tus credenciales.' })
          setLoading(false)
          return
        }
      }

      // Save settings with verified connection status
      const response = await fetch('/api/settings/ghl', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ghl_connected: connectionVerified,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      setIsConnected(connectionVerified)
      setTestResult(connectionVerified
        ? { success: true, message: 'Conexion verificada y ajustes guardados!' }
        : null
      )
      router.refresh()

      // Keep success state for longer to show feedback
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/settings/ghl/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghl_api_key: formData.ghl_api_key,
          ghl_location_id: formData.ghl_location_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setTestResult({ success: false, message: data.error || 'Connection failed' })
      } else {
        setTestResult({ success: true, message: 'Conexion exitosa! Haz clic en Guardar para confirmar.' })
      }
    } catch {
      setTestResult({ success: false, message: 'Error al probar la conexion' })
    } finally {
      setTesting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Reset connection status when credentials change
    if (name === 'ghl_api_key' || name === 'ghl_location_id') {
      setIsConnected(false)
      setTestResult(null)
    }
  }

  const inputClasses = `
    w-full px-4 py-3
    bg-white/5 backdrop-blur-md
    border border-white/10
    rounded-2xl
    text-white placeholder-white/30
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30
    text-sm font-mono
    transition-all duration-200
  `

  const labelClasses = "block text-sm font-medium text-white/70 mb-2"

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Integracion GoHighLevel</h2>
          <p className="text-sm text-white/50 mt-1">
            Conecta tu cuenta GHL para sincronizar contactos automaticamente
          </p>
        </div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white/60 border border-white/20">
            No Conectado
          </span>
        )}
      </div>

      {/* Success Message */}
      {success && !testResult && (
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

      {/* Test Result */}
      {testResult && (
        <div
          className={`backdrop-blur-xl rounded-2xl px-4 py-3 mb-6 flex items-center gap-2 ${
            testResult.success
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {testResult.success ? (
            <svg className="w-5 h-5 text-emerald-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className={`text-sm ${testResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
            {testResult.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="ghl_api_key" className={labelClasses}>
            API Key
          </label>
          <input
            id="ghl_api_key"
            name="ghl_api_key"
            type="password"
            value={formData.ghl_api_key}
            onChange={handleChange}
            placeholder="Ingresa tu API key de GHL"
            className={inputClasses}
          />
          <p className="text-xs text-white/40 mt-2">
            Se encuentra en Settings &rarr; Business Profile &rarr; API Key in your GHL dashboard
          </p>
        </div>

        <div>
          <label htmlFor="ghl_location_id" className={labelClasses}>
            Location ID
          </label>
          <input
            id="ghl_location_id"
            name="ghl_location_id"
            type="text"
            value={formData.ghl_location_id}
            onChange={handleChange}
            placeholder="Ingresa tu Location ID de GHL"
            className={inputClasses}
          />
          <p className="text-xs text-white/40 mt-2">
            Se encuentra en Settings &rarr; Business Profile &rarr; Location ID
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="ghl_auto_sync"
            name="ghl_auto_sync"
            type="checkbox"
            checked={formData.ghl_auto_sync}
            onChange={handleChange}
            className="
              w-5 h-5
              rounded
              border-white/30 bg-white/10
              text-white
              focus:ring-white/30
            "
          />
          <label htmlFor="ghl_auto_sync" className="text-sm text-white/70">
            Sincronizar automaticamente nuevos contactos a GoHighLevel
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !formData.ghl_api_key || !formData.ghl_location_id}
            className="
              px-6 py-3
              bg-white/5 backdrop-blur-md
              border border-white/10
              text-white/70
              rounded-2xl font-medium
              hover:bg-white/10 hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            {testing && (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {testing ? 'Probando...' : 'Probar Conexion'}
          </button>

          <button
            type="submit"
            disabled={loading || success}
            className={`
              px-6 py-3
              backdrop-blur-md
              rounded-2xl font-medium
              disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
              ${success
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }
              ${loading ? 'opacity-50' : ''}
            `}
          >
            {loading && (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {success && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {loading ? 'Guardando...' : success ? 'Guardado!' : 'Guardar Ajustes'}
          </button>
        </div>
      </form>
    </div>
  )
}
