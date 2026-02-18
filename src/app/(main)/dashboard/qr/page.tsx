'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'

export default function QRPage() {
  const [cardUrl, setCardUrl] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
        setCardUrl(`${baseUrl}/c/${profile.username}`)
      }
    }
    fetchProfile()
  }, [])

  if (!cardUrl) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <QRCodeSVG
        value={cardUrl}
        size={320}
        level="H"
        bgColor="#ffffff"
        fgColor="#000000"
      />
      <p className="mt-6 text-black/40 text-sm font-medium tracking-wide">
        Escanea para conectar
      </p>
    </div>
  )
}
