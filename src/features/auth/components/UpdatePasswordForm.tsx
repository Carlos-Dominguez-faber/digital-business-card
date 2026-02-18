'use client'

import { useState } from 'react'
import { updatePassword } from '@/actions/auth'

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updatePassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/80">
          Nueva Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Min. 6 caracteres"
          className="
            w-full px-4 py-3
            bg-white/5 backdrop-blur-md
            border border-white/20
            rounded-xl
            text-white placeholder-white/40
            focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
            transition-all duration-200
          "
        />
      </div>

      {error && (
        <div className="
          bg-red-500/10 backdrop-blur-sm
          border border-red-400/30
          rounded-xl px-4 py-3
        ">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full px-4 py-3
          bg-white/15 backdrop-blur-md
          border border-white/25
          rounded-xl
          text-white font-medium
          shadow-lg
          hover:bg-white/25 hover:shadow-xl
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {loading ? 'Actualizando...' : 'Actualizar Contrasena'}
      </button>
    </form>
  )
}
