'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { INTEREST_OPTIONS } from '@/types/database'

interface ContactsFiltersProps {
  currentSearch?: string
  currentInterest?: string
  currentStatus?: string
}

export function ContactsFilters({
  currentSearch = '',
  currentInterest = 'all',
  currentStatus = 'all',
}: ContactsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/dashboard/contacts?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/dashboard/contacts')
    })
  }

  const hasFilters = currentSearch || currentInterest !== 'all' || currentStatus !== 'all'

  const inputClasses = `
    px-4 py-2.5
    bg-white/5 backdrop-blur-md
    border border-white/10
    rounded-2xl
    text-white placeholder-white/30
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30
    text-sm
    transition-all duration-200
  `

  const selectClasses = `
    px-4 py-2.5
    bg-white/5 backdrop-blur-md
    border border-white/10
    rounded-2xl
    text-white
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30
    text-sm
    transition-all duration-200
    min-w-[140px]
    [[&>option]:bg-slate-800>option]:bg-neutral-800 [&>option]:text-white
  `

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o empresa..."
              className={`w-full pl-10 pr-4 ${inputClasses}`}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* Interest Filter */}
        <select
          value={currentInterest}
          onChange={(e) => updateFilters('interest', e.target.value)}
          className={selectClasses}
        >
          <option value="all">Todos los Intereses</option>
          {INTEREST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* GHL Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateFilters('status', e.target.value)}
          className={selectClasses}
        >
          <option value="all">Todos los Estados</option>
          <option value="synced">Sincronizado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="
              px-4 py-2.5
              text-white/60
              hover:text-white
              text-sm font-medium
              transition-colors
            "
          >
            Clear
          </button>
        )}
      </div>

      {isPending && (
        <div className="mt-3 text-sm text-white/50">Cargando...</div>
      )}
    </div>
  )
}
