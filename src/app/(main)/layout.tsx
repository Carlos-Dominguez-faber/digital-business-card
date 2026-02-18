import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/features/dashboard/components/DashboardNav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#050505] noise-overlay">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[450px] h-[450px] bg-amber-500/[0.05] rounded-full blur-[120px] animate-blob" />
        <div className="absolute -bottom-48 -left-24 w-[350px] h-[350px] bg-orange-600/[0.03] rounded-full blur-[100px] animate-blob-delay-2" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[100px] animate-blob-delay-4" />
      </div>

      <DashboardNav profile={profile} />
      <main className="relative z-10 pt-16 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  )
}
