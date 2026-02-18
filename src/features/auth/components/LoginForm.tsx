'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
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
            focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/20
            transition-all duration-200
          "
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/80">
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="********"
          className="
            w-full px-4 py-3
            bg-white/5 backdrop-blur-md
            border border-white/20
            rounded-xl
            text-white placeholder-white/40
            focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/20
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
          bg-amber-500/15 backdrop-blur-md
          border border-amber-400/20
          rounded-xl
          text-amber-100 font-medium tracking-wide
          shadow-lg shadow-amber-500/5
          hover:bg-amber-500/20 hover:border-amber-400/30 hover:shadow-xl
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
        "
      >
        {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
      </button>

      <p className="text-center text-sm text-white/60">
        <Link
          href="/forgot-password"
          className="text-white/80 hover:text-white transition-colors"
        >
          Olvidaste tu contrasena?
        </Link>
      </p>
    </form>
  )
}
