import { createClient } from '@/lib/supabase/server'
import { GHLSettings } from '@/features/dashboard/components/GHLSettings'
import { NotificationSettings } from '@/features/dashboard/components/NotificationSettings'
import { AccountSettings } from '@/features/dashboard/components/AccountSettings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile with GHL settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Ajustes</h1>
        <p className="mt-2 text-white/60">
          Configura tus integraciones y notificaciones
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Settings - Email & Password */}
        <AccountSettings email={user.email || ''} createdAt={user.created_at} />

        {/* GoHighLevel Settings */}
        <GHLSettings profile={profile} />

        {/* Notification Settings */}
        <NotificationSettings profile={profile} />
      </div>
    </div>
  )
}
