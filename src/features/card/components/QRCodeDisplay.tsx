'use client'

import { useEffect, useState } from 'react'
import type { Profile } from '@/types/database'

interface QRCodeDisplayProps {
  profile: Profile
}

export function QRCodeDisplay({ profile }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    // Generate QR code that links to the vCard download URL
    // This is more reliable than embedding vCard data directly because:
    // 1. The QR code is smaller and always scannable
    // 2. The downloaded vCard includes the photo
    // 3. All data is properly formatted for iOS
    const vcardUrl = `${window.location.origin}/c/${profile.username}/vcard`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vcardUrl)}&ecc=M`
    setQrDataUrl(qrApiUrl)
  }, [profile.username])

  if (!qrDataUrl) {
    return (
      <div className="w-[200px] h-[200px] mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
        <span className="text-slate-400">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${profile.full_name}`}
        width={200}
        height={200}
        className="rounded-xl"
      />
    </div>
  )
}
