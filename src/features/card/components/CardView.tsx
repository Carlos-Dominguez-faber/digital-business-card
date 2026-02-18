'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { ExchangeForm } from './ExchangeForm'
import { QRCodeDisplay } from './QRCodeDisplay'

interface CardViewProps {
  profile: Profile
}

function getDomainFromUrl(url: string): string {
  try { return new URL(url).hostname } catch { return '' }
}

function getFaviconUrl(url: string): string {
  const domain = getDomainFromUrl(url)
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : ''
}

export function CardView({ profile }: CardViewProps) {
  const [showExchangeForm, setShowExchangeForm] = useState(false)
  const [showQRFallback, setShowQRFallback] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkOwnership = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === profile.id) setIsOwner(true)
    }
    checkOwnership()
  }, [profile.id])

  const trackClick = async (eventType: string, data?: Record<string, unknown>) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profile.id, event_type: eventType, event_data: data }),
      })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  const handleSaveContact = () => {
    trackClick('vcf_download')
    window.location.href = `/c/${profile.username}/vcard`
  }

  const handlePhoneClick = () => trackClick('phone_click', { phone: profile.phone })
  const handleEmailClick = () => trackClick('email_click', { email: profile.email_public || profile.email })
  const handleWebsiteClick = () => trackClick('website_click', { url: profile.website })
  const handleSocialClick = (platform: string, url: string) => trackClick('social_click', { platform, url })

  const resources = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1
    const title = profile[`resource_title_${num}` as keyof Profile] as string | null
    const url = profile[`resource_url_${num}` as keyof Profile] as string | null
    return title && url ? { title, url } : null
  }).filter(Boolean) as { title: string; url: string }[]

  const hasSocialLinks = profile.linkedin_url || profile.instagram_url || profile.facebook_url

  const renderBio = (text: string) => {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 decoration-amber-400/40 transition-colors">$1</a>')
      .replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] relative overflow-hidden noise-overlay">
      {/* Background atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/[0.06] rounded-full blur-[150px] animate-blob" />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] bg-orange-600/[0.04] rounded-full blur-[120px] animate-blob-delay-2" />
        <div className="absolute top-1/3 -right-20 w-[350px] h-[350px] bg-amber-500/[0.03] rounded-full blur-[120px] animate-blob-delay-4" />
      </div>

      {/* Owner nav */}
      {isOwner && (
        <div className="relative z-10 pt-4 px-4">
          <div className="max-w-md mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 text-white/50 text-sm hover:text-white/80 transition-colors rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 pt-14 pb-28 px-6">
        <div className="max-w-md mx-auto text-center animate-fade-up">
          {/* Photo */}
          <div className="relative w-32 h-32 mx-auto mb-7">
            <div className="absolute -inset-[3px] bg-gradient-to-br from-amber-400/25 via-transparent to-amber-600/15 rounded-full" />
            {profile.photo_url ? (
              <Image src={profile.photo_url} alt={profile.full_name} fill className="rounded-full object-cover border-2 border-white/10 shadow-2xl relative z-10" priority />
            ) : (
              <div className="w-full h-full rounded-full bg-white/[0.06] border-2 border-white/10 flex items-center justify-center text-4xl font-bold text-white relative z-10">
                {profile.full_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
            {profile.full_name}
          </h1>
          {profile.job_title && (
            <p className="text-base text-white/70 mt-2 font-light">{profile.job_title}</p>
          )}
          {profile.company && (
            <p className="text-white/50 mt-1">{profile.company}</p>
          )}
          {profile.location && (
            <p className="text-white/40 text-sm mt-3 flex items-center justify-center gap-1.5 uppercase tracking-widest font-light">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}

          {/* Accent line */}
          <div className="mt-7 mx-auto w-10 h-[2px] accent-shimmer rounded-full" />
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 -mt-16 relative z-10">
        <div className="max-w-md mx-auto px-4 pb-8">

          {/* Actions */}
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-2xl p-6 mb-5 animate-fade-up animate-fade-up-1">
            <button
              onClick={handleSaveContact}
              className="w-full py-4 px-6 bg-white text-[#0a0a0a] rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-white/95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Guardar Contacto
            </button>

            <button
              onClick={() => setShowQRFallback(!showQRFallback)}
              className="w-full mt-3 py-2 text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              {showQRFallback ? 'Ocultar codigo QR' : 'El boton no funciona? Escanea el QR'}
            </button>

            {showQRFallback && (
              <div className="mt-4 p-4 bg-white rounded-2xl">
                <QRCodeDisplay profile={profile} />
                <p className="text-center text-xs text-neutral-500 mt-2">Escanea con la camara de tu iPhone para agregar contacto</p>
              </div>
            )}

            <button
              onClick={() => { trackClick('form_open'); setShowExchangeForm(true) }}
              className="w-full mt-4 py-4 px-6 bg-amber-500/10 border border-amber-400/20 text-amber-100 rounded-2xl font-semibold text-lg hover:bg-amber-500/15 hover:border-amber-400/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Compartir tu Contacto
            </button>
          </div>

          {/* Contact info */}
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-xl p-5 mb-5 animate-fade-up animate-fade-up-2">
            <h3 className="text-white/40 text-xs font-semibold mb-3 px-2 tracking-[0.12em] uppercase">Contacto</h3>

            {profile.phone && (
              <a href={`tel:${profile.phone}`} onClick={handlePhoneClick} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{profile.phone}</p>
                  <p className="text-white/40 text-sm">Llamar</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
              </a>
            )}

            {(profile.email_public || profile.email) && (
              <a href={`mailto:${profile.email_public || profile.email}`} onClick={handleEmailClick} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{profile.email_public || profile.email}</p>
                  <p className="text-white/40 text-sm">Correo</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
              </a>
            )}

            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" onClick={handleWebsiteClick} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">Sitio Web</p>
                  <p className="text-white/40 text-sm truncate">{profile.website}</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
              </a>
            )}

            {profile.calendar_url && (
              <a href={profile.calendar_url} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('website_click', { url: profile.calendar_url })} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-10 h-10 bg-amber-500/[0.08] rounded-xl flex items-center justify-center group-hover:bg-amber-500/[0.12] transition-colors">
                  <svg className="w-5 h-5 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Agendar una Reunion</p>
                  <p className="text-white/40 text-sm">Agenda tiempo en mi calendario</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
              </a>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-xl p-6 mb-5 animate-fade-up animate-fade-up-3">
              <h3 className="text-white/40 text-xs font-semibold mb-3 tracking-[0.12em] uppercase">Acerca de</h3>
              <div className="text-white/75 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderBio(profile.bio) }} />
            </div>
          )}

          {/* Social */}
          {hasSocialLinks && (
            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-xl p-5 mb-5 animate-fade-up animate-fade-up-4">
              <h3 className="text-white/40 text-xs font-semibold mb-3 px-2 tracking-[0.12em] uppercase">Conectar</h3>
              <div className="grid grid-cols-3 gap-3">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('linkedin', profile.linkedin_url!)} className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
                    <div className="w-10 h-10 bg-[#0077B5]/15 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </div>
                    <span className="text-white/55 text-xs">LinkedIn</span>
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('instagram', profile.instagram_url!)} className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#833AB4]/15 via-[#FD1D1D]/15 to-[#F77737]/15 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <span className="text-white/55 text-xs">Instagram</span>
                  </a>
                )}
                {profile.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" onClick={() => handleSocialClick('facebook', profile.facebook_url!)} className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all">
                    <div className="w-10 h-10 bg-[#1877F2]/15 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <span className="text-white/55 text-xs">Facebook</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {resources.length > 0 && (
            <div className="mb-5 animate-fade-up animate-fade-up-5">
              <h3 className="text-white/40 text-xs font-semibold mb-3 px-2 tracking-[0.12em] uppercase">Recursos</h3>
              <div className="space-y-2.5">
                {resources.map((resource, index) => (
                  <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => trackClick('resource_click', { resource: resource.title, url: resource.url })} className="flex items-center gap-4 p-4 bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-2xl hover:bg-white/[0.08] hover:border-white/[0.1] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group">
                    <div className="w-11 h-11 bg-white/[0.06] rounded-xl flex items-center justify-center overflow-hidden border border-white/[0.06] group-hover:border-white/[0.1] transition-colors">
                      <Image src={getFaviconUrl(resource.url)} alt="" width={24} height={24} className="w-6 h-6" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; t.parentElement!.innerHTML = '<svg class="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{resource.title}</p>
                      <p className="text-white/30 text-sm truncate">{getDomainFromUrl(resource.url)}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {profile.show_video && profile.video_embed_url && (
            <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.07] rounded-3xl shadow-xl p-5 mb-5 overflow-hidden">
              <h3 className="text-white/40 text-xs font-semibold mb-3 px-1 tracking-[0.12em] uppercase">Presentacion</h3>
              <div className="aspect-video rounded-2xl overflow-hidden bg-black/50">
                <iframe src={getEmbedUrl(profile.video_embed_url)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen onLoad={() => trackClick('video_view')} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-white/20 text-xs tracking-[0.2em] uppercase font-light">{profile.full_name}</p>
          </div>
        </div>
      </div>

      {showExchangeForm && (
        <ExchangeForm profileId={profile.id} profileName={profile.full_name} onClose={() => setShowExchangeForm(false)} />
      )}
    </div>
  )
}

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}
