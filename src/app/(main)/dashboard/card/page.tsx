import { createClient } from '@/lib/supabase/server'
import { CardEditor } from '@/features/dashboard/components/CardEditor'

export default async function CardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Tarjeta</h1>
        <p className="mt-2 text-white/60">
          Personaliza tu tarjeta de presentacion digital
        </p>
      </div>

      <CardEditor profile={profile} />
    </div>
  )
}
