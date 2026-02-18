'use client'

import { useState } from 'react'
import { INTEREST_OPTIONS } from '@/types/database'
import type { InterestType } from '@/types/database'

interface ExchangeFormProps {
  profileId: string
  profileName: string
  onClose: () => void
}

export function ExchangeForm({ profileId, profileName, onClose }: ExchangeFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    interest_type: '' as InterestType | '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Success Message - Liquid Glass */}
        <div className="relative w-full max-w-md mx-4 mb-6 sm:mb-0 bg-white/85 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 text-center animate-slide-up">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Gracias!
          </h2>
          <p className="text-slate-600 mb-6">
            {profileName} tiene tu informacion y se comunicara contigo pronto.
          </p>
          <button
            onClick={onClose}
            className="
              w-full py-4 px-6
              bg-orange-500/80 backdrop-blur-sm
              border border-orange-400/30
              text-white
              rounded-2xl font-semibold
              shadow-lg shadow-orange-500/25
              hover:bg-orange-500/90 hover:border-orange-400/50
              transition-all
            "
          >
            Listo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Form Modal - Liquid Glass */}
      <div className="relative w-full max-w-md mx-4 mb-6 sm:mb-0 bg-white/85 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-md px-6 py-5 border-b border-white/20 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Comparte tu Informacion
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                con {profileName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre Completo */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              id="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Tu nombre"
              className="
                w-full px-4 py-4
                bg-slate-50
                border border-slate-200
                rounded-2xl
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                transition-all
                text-base
              "
              autoComplete="name"
              autoCapitalize="words"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className="
                w-full px-4 py-4
                bg-slate-50
                border border-slate-200
                rounded-2xl
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                transition-all
                text-base
              "
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="
                w-full px-4 py-4
                bg-slate-50
                border border-slate-200
                rounded-2xl
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                transition-all
                text-base
              "
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          {/* Interest Type */}
          <div>
            <label htmlFor="interest_type" className="block text-sm font-medium text-slate-700 mb-2">
              Me interesa <span className="text-red-500">*</span>
            </label>
            <select
              id="interest_type"
              required
              value={formData.interest_type}
              onChange={(e) => setFormData({ ...formData, interest_type: e.target.value as InterestType })}
              className="
                w-full px-4 py-4
                bg-slate-50
                border border-slate-200
                rounded-2xl
                text-slate-900
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                transition-all
                text-base
                appearance-none
                cursor-pointer
              "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '20px',
              }}
            >
              <option value="">Selecciona uno...</option>
              {INTEREST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              Mensaje <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Cuentame un poco sobre ti o lo que buscas..."
              rows={4}
              maxLength={500}
              className="
                w-full px-4 py-4
                bg-slate-50
                border border-slate-200
                rounded-2xl
                text-slate-900 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                transition-all
                text-base
                resize-none
              "
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {formData.message.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button - Liquid Glass Blue */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 px-6
              bg-orange-500/80 backdrop-blur-sm
              border border-orange-400/30
              text-white
              rounded-2xl font-semibold text-lg
              shadow-lg shadow-orange-500/25
              hover:bg-orange-500/90 hover:border-orange-400/50 hover:shadow-xl
              active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? 'Enviando...' : 'Enviar mi Info'}
          </button>
        </form>
      </div>
    </div>
  )
}
