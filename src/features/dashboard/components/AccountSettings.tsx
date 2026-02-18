'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AccountSettingsProps {
  email: string
  createdAt: string
}

export function AccountSettings({ email, createdAt }: AccountSettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contrasena debe tener al menos 6 caracteres' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contrasenas no coinciden' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Contrasena actualizada exitosamente' })
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al actualizar la contrasena' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Ingresa un correo electronico valido' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Correo de confirmacion enviado a ambas direcciones. Revisa tu bandeja.' })
      setNewEmail('')
      setIsChangingEmail(false)
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al actualizar el correo' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Cuenta</h2>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Section */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Correo</p>
              <p className="text-white">{email}</p>
            </div>
            {!isChangingEmail && (
              <button
                onClick={() => {
                  setIsChangingEmail(true)
                  setIsChangingPassword(false)
                  setMessage(null)
                }}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Change
              </button>
            )}
          </div>

          {isChangingEmail && (
            <form onSubmit={handleEmailChange} className="mt-3 space-y-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Nuevo correo electronico"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Actualizar Correo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingEmail(false)
                    setNewEmail('')
                    setMessage(null)
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-white/40">
                Se enviara un enlace de confirmacion a ambas direcciones de correo.
              </p>
            </form>
          )}
        </div>

        {/* Password Section */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Contrasena</p>
              <p className="text-white">••••••••</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => {
                  setIsChangingPassword(true)
                  setIsChangingEmail(false)
                  setMessage(null)
                }}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                Change
              </button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="mt-3 space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contrasena"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all"
                autoFocus
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nueva contrasena"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contrasena'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setMessage(null)
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Cuenta Creada */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-white/50">Cuenta Creada</p>
          <p className="text-white">
            {new Date(createdAt).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
