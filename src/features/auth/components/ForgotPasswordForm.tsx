'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="
        bg-green-500/10 backdrop-blur-sm
        border border-green-400/30
        rounded-xl px-6 py-8
        text-center
      ">
        <div className="text-4xl mb-4">📧</div>
        <p className="text-green-300 font-medium">Revisa tu correo</p>
        <p className="text-white/60 text-sm mt-2">
          Te enviamos un enlace para restablecer tu contrasena.
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
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
        {loading ? 'Enviando...' : 'Enviar Enlace'}
      </button>
    </form>
  )
}
