/**
 * Public Card Landing Page
 *
 * /c/[username]
 *
 * This is the public-facing digital business card that recipients see
 * when they scan a QR code or tap an NFC card.
 *
 * CRITICAL: Must work perfectly on iPhone Safari
 */

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardView } from '@/features/card/components/CardView'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  // Normalize username to lowercase
  const normalizedUsername = username.toLowerCase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, job_title, company, photo_url')
    .eq('username', normalizedUsername)
    .single()

  if (!profile) {
    return {
      title: 'Perfil No Encontrado',
    }
  }

  return {
    title: `${profile.full_name} | Tarjeta Digital`,
    description: profile.job_title || `Conecta con ${profile.full_name}`,
    openGraph: {
      title: profile.full_name,
      description: profile.job_title || `${profile.company || 'Professional'}`,
      images: profile.photo_url ? [profile.photo_url] : [],
    },
  }
}

export default async function PublicCardPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  // Normalize username to lowercase for case-insensitive lookup
  const normalizedUsername = username.toLowerCase()

  // Fetch profile by username (case-insensitive)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', normalizedUsername)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Track page view
  await supabase.from('events').insert({
    profile_id: profile.id,
    event_type: 'page_view',
    source: 'direct_link',
  })

  return (
    <main className="min-h-screen">
      <CardView profile={profile} />
    </main>
  )
}
