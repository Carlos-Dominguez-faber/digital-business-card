import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent contacts
  const { data: contacts, count: totalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get today's views
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayViews } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('event_type', 'page_view')
    .gte('created_at', today.toISOString())

  // Get pending syncs
  const { count: pendingSyncs } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)
    .eq('ghl_sync_status', 'pending')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido, {profile?.full_name?.split(' ')[0] || 'usuario'}!
        </h1>
        <p className="mt-2 text-white/60">
          Esto es lo que pasa con tu tarjeta digital
        </p>
      </div>

      {/* Quick Actions Alert */}
      {!profile?.username && (
        <div className="mb-8 bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Image
              src="/icons/warning.svg"
              alt="Warning"
              width={24}
              height={24}
              className="mt-0.5"
            />
            <div>
              <h3 className="font-semibold text-amber-200">Completa tu Configuracion</h3>
              <p className="text-amber-200/70 text-sm mt-1">
                Configura un nombre de usuario para que tu tarjeta sea publica.
              </p>
              <Link
                href="/dashboard/card"
                className="
                  inline-block mt-3
                  px-4 py-2
                  bg-amber-500/20 backdrop-blur-md
                  border border-amber-500/30
                  text-amber-100
                  rounded-2xl text-sm font-medium
                  hover:bg-amber-500/30
                  transition-all duration-200
                "
              >
                Configurar Mi Tarjeta
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Contacts */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Total Contactos</p>
              <p className="text-4xl font-bold text-white mt-2">{totalContacts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Image
                src="/icons/users.svg"
                alt="Contacts"
                width={24}
                height={24}
                className="opacity-80 invert"
              />
            </div>
          </div>
        </div>

        {/* Views Today */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Visitas Hoy</p>
              <p className="text-4xl font-bold text-white mt-2">{todayViews || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Image
                src="/icons/eye.svg"
                alt="Views"
                width={24}
                height={24}
                className="opacity-80 invert"
              />
            </div>
          </div>
        </div>

        {/* GHL Pending */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">GHL Pendientes</p>
              <p className="text-4xl font-bold text-white mt-2">{pendingSyncs || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Image
                src="/icons/clock.svg"
                alt="Pending"
                width={24}
                height={24}
                className="opacity-80 invert"
              />
            </div>
          </div>
        </div>

        {/* GHL Status */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Estado GHL</p>
              <p className="text-lg font-semibold mt-2">
                {profile?.ghl_connected ? (
                  <span className="text-emerald-400">Conectado</span>
                ) : (
                  <span className="text-white/40">No Conectado</span>
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Image
                src="/icons/link.svg"
                alt="Status"
                width={24}
                height={24}
                className="opacity-80 invert"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Card Preview + Recent Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Card Preview */}
        {profile?.username && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tu Tarjeta</h2>
              <Link
                href="/dashboard/card"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Editar
              </Link>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl mb-4 overflow-hidden">
                {profile.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {profile.full_name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-white">{profile.full_name}</h3>
              <p className="text-white/60 text-sm">{profile.job_title || 'Sin titulo'}</p>
              <p className="text-white/40 text-xs mt-1">{profile.company || 'Sin empresa'}</p>

              <div className="flex gap-2 mt-4 w-full">
                <Link
                  href={`/c/${profile.username}`}
                  target="_blank"
                  className="
                    flex-1 py-2.5
                    bg-white/10 backdrop-blur-md
                    border border-white/20
                    text-white text-sm font-medium
                    rounded-2xl text-center
                    hover:bg-white/20
                    transition-all duration-200
                  "
                >
                  Ver
                </Link>
                <Link
                  href={`/c/${profile.username}/vcard`}
                  className="
                    flex-1 py-2.5
                    bg-white/5 backdrop-blur-md
                    border border-white/10
                    text-white/70 text-sm font-medium
                    rounded-2xl text-center
                    hover:bg-white/10 hover:text-white
                    transition-all duration-200
                  "
                >
                  VCF
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Contacts */}
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 ${profile?.username ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Contactos Recientes</h2>
            <Link
              href="/dashboard/contacts"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Ver Todos
            </Link>
          </div>

          {contacts && contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {contact.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{contact.full_name}</p>
                      <p className="text-sm text-white/50">{contact.email}</p>
                    </div>
                  </div>
                  <div>
                    {contact.ghl_sync_status === 'synced' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Sincronizado
                      </span>
                    ) : contact.ghl_sync_status === 'failed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                        Fallido
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Image
                  src="/icons/inbox.svg"
                  alt="Empty"
                  width={32}
                  height={32}
                  className="opacity-30 invert"
                />
              </div>
              <p className="text-white/60">Aun no hay contactos</p>
              <p className="text-sm text-white/40 mt-1">
                Comparte tu tarjeta para empezar a recopilar contactos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
