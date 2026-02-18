import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ContactsTable } from '@/features/dashboard/components/ContactsTable'
import { ContactsFilters } from '@/features/dashboard/components/ContactsFilters'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; interest?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Build query with filters
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  // Apply search filter
  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,company.ilike.%${params.search}%`)
  }

  // Apply interest filter
  if (params.interest && params.interest !== 'all') {
    query = query.eq('interest_type', params.interest)
  }

  // Apply GHL status filter
  if (params.status && params.status !== 'all') {
    query = query.eq('ghl_sync_status', params.status)
  }

  const { data: contacts, count: totalContacts } = await query

  // Get stats
  const { count: pendingCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('ghl_sync_status', 'pending')

  const { count: syncedCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('ghl_sync_status', 'synced')

  const { count: failedCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('ghl_sync_status', 'failed')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Contactos</h1>
            <p className="mt-2 text-white/60">
              Administra todos tus contactos recopilados
            </p>
          </div>
          <Link
            href="/api/contacts/export"
            className="
              px-4 py-2.5
              bg-white/10 backdrop-blur-md
              border border-white/20
              text-white
              rounded-2xl text-sm font-medium
              hover:bg-white/20
              transition-all duration-200
            "
          >
            Exportar CSV
          </Link>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <p className="text-sm text-white/50">Total</p>
          <p className="text-2xl font-bold text-white">{totalContacts || 0}</p>
        </div>
        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-sm text-emerald-300/70">Sincronizados</p>
          <p className="text-2xl font-bold text-emerald-300">{syncedCount || 0}</p>
        </div>
        <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
          <p className="text-sm text-amber-300/70">Pendientes</p>
          <p className="text-2xl font-bold text-amber-300">{pendingCount || 0}</p>
        </div>
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
          <p className="text-sm text-red-300/70">Fallidos</p>
          <p className="text-2xl font-bold text-red-300">{failedCount || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <ContactsFilters
        currentSearch={params.search}
        currentInterest={params.interest}
        currentStatus={params.status}
      />

      {/* Contacts Table */}
      {contacts && contacts.length > 0 ? (
        <ContactsTable contacts={contacts} />
      ) : (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image
              src="/icons/inbox.svg"
              alt="Empty"
              width={32}
              height={32}
              className="opacity-30 invert"
            />
          </div>
          <p className="text-white/60">No se encontraron contactos</p>
          <p className="text-sm text-white/40 mt-1">
            {params.search || params.interest || params.status
              ? 'Intenta ajustar tus filtros'
              : 'Comparte tu tarjeta para empezar a recopilar contactos'}
          </p>
        </div>
      )}
    </div>
  )
}
