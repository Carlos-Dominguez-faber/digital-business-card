'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { PhotoUpload } from './PhotoUpload'

interface CardEditorProps {
  profile: Profile | null
}

const MAX_RESOURCES = 10
const DEFAULT_RESOURCES = 3

export function CardEditor({ profile }: CardEditorProps) {
  const router = useRouter()
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate initial visible resources based on existing data
  const getInitialResourceCount = () => {
    for (let i = MAX_RESOURCES; i > DEFAULT_RESOURCES; i--) {
      const titleKey = `resource_title_${i}` as keyof Profile
      const urlKey = `resource_url_${i}` as keyof Profile
      if (profile?.[titleKey] || profile?.[urlKey]) {
        return i
      }
    }
    return DEFAULT_RESOURCES
  }

  const [visibleResources, setVisibleResources] = useState(getInitialResourceCount())

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    photo_url: profile?.photo_url || '',
    job_title: profile?.job_title || '',
    location: profile?.location || '',
    company: profile?.company || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    email_public: profile?.email_public || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    instagram_url: profile?.instagram_url || '',
    facebook_url: profile?.facebook_url || '',
    video_embed_url: profile?.video_embed_url || '',
    show_video: profile?.show_video ?? false,
    resource_title_1: profile?.resource_title_1 || '',
    resource_url_1: profile?.resource_url_1 || '',
    resource_title_2: profile?.resource_title_2 || '',
    resource_url_2: profile?.resource_url_2 || '',
    resource_title_3: profile?.resource_title_3 || '',
    resource_url_3: profile?.resource_url_3 || '',
    resource_title_4: profile?.resource_title_4 || '',
    resource_url_4: profile?.resource_url_4 || '',
    resource_title_5: profile?.resource_title_5 || '',
    resource_url_5: profile?.resource_url_5 || '',
    resource_title_6: profile?.resource_title_6 || '',
    resource_url_6: profile?.resource_url_6 || '',
    resource_title_7: profile?.resource_title_7 || '',
    resource_url_7: profile?.resource_url_7 || '',
    resource_title_8: profile?.resource_title_8 || '',
    resource_url_8: profile?.resource_url_8 || '',
    resource_title_9: profile?.resource_title_9 || '',
    resource_url_9: profile?.resource_url_9 || '',
    resource_title_10: profile?.resource_title_10 || '',
    resource_url_10: profile?.resource_url_10 || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Normalize username to lowercase
      const dataToSave = {
        ...formData,
        username: formData.username.toLowerCase().trim(),
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      router.refresh()

      // Open card in new tab after 1.5 seconds
      setTimeout(() => {
        window.open(`/c/${formData.username}`, '_blank')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addResource = () => {
    if (visibleResources < MAX_RESOURCES) {
      setVisibleResources(visibleResources + 1)
    }
  }

  const removeResource = (num: number) => {
    // Clear the resource data
    setFormData((prev) => ({
      ...prev,
      [`resource_title_${num}`]: '',
      [`resource_url_${num}`]: '',
    }))

    // Shift remaining resources up
    const newFormData: Record<string, unknown> = { ...formData }
    for (let i = num; i < visibleResources; i++) {
      newFormData[`resource_title_${i}`] = formData[`resource_title_${i + 1}` as keyof typeof formData] as string
      newFormData[`resource_url_${i}`] = formData[`resource_url_${i + 1}` as keyof typeof formData] as string
    }
    // Clear the last visible one
    newFormData[`resource_title_${visibleResources}`] = ''
    newFormData[`resource_url_${visibleResources}`] = ''

    setFormData(newFormData as typeof formData)
    setVisibleResources(Math.max(DEFAULT_RESOURCES, visibleResources - 1))
  }

  // Rich text formatting functions
  const insertFormatting = (before: string, after: string = before) => {
    const textarea = bioRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.bio
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    setFormData((prev) => ({ ...prev, bio: newText }))

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const inputClasses = `
    w-full px-4 py-3
    bg-white/5 backdrop-blur-md
    border border-white/10
    rounded-2xl
    text-white placeholder-white/30
    focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30
    text-sm
    transition-all duration-200
  `

  const labelClasses = "block text-sm font-medium text-white/70 mb-2"

  const formatButtonClasses = `
    p-2
    bg-white/5 hover:bg-white/10
    border border-white/10
    rounded-xl
    text-white/60 hover:text-white
    transition-all duration-200
    text-xs font-medium
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl px-4 py-3">
          <p className="text-sm text-emerald-300">Cambios guardados exitosamente!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Card URL Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">URL de la Tarjeta</h2>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">{typeof window !== 'undefined' ? window.location.host : ''}/c/{formData.username}</span>
          <Link
            href={`/c/${formData.username}`}
            target="_blank"
            className="
              px-3 py-1.5
              bg-white/10 hover:bg-white/20
              border border-white/20
              rounded-xl
              text-white/70 hover:text-white
              text-xs font-medium
              transition-all duration-200
            "
          >
            Ver Tarjeta
          </Link>
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Foto de Perfil</h2>
        <PhotoUpload
          currentPhotoUrl={formData.photo_url}
          fullName={formData.full_name}
          onPhotoUploaded={(url) => setFormData((prev) => ({ ...prev, photo_url: url }))}
        />
      </div>

      {/* Basic Info Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informacion Basica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="full_name" className={labelClasses}>
              Nombre Completo <span className="text-red-400">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Tu Nombre"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="job_title" className={labelClasses}>
              Titulo Profesional
            </label>
            <input
              id="job_title"
              name="job_title"
              type="text"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="Tu titulo profesional"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="location" className={labelClasses}>
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Tu ciudad"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="company" className={labelClasses}>
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Tu empresa"
              className={inputClasses}
            />
          </div>

          {/* Bio with Rich Text */}
          <div className="sm:col-span-2">
            <label htmlFor="bio" className={labelClasses}>
              Bio
            </label>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => insertFormatting('**')}
                className={formatButtonClasses}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*')}
                className={formatButtonClasses}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](url)')}
                className={formatButtonClasses}
                title="Link"
              >
                <Image
                  src="/icons/link.svg"
                  alt="Link"
                  width={14}
                  height={14}
                  className="opacity-70 invert"
                />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n- ', '')}
                className={formatButtonClasses}
                title="Bullet List"
              >
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n\n', '')}
                className={formatButtonClasses}
                title="New Paragraph"
              >
                <span>Para</span>
              </button>
            </div>

            <textarea
              ref={bioRef}
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuenta tu historia... Comparte tu experiencia y lo que te apasiona. Formato markdown: **negrita**, *cursiva*, [enlaces](url)"
              rows={6}
              maxLength={2000}
              className={`${inputClasses} resize-y min-h-[150px] max-h-[500px]`}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-white/40">
                Formato basico: **negrita**, *cursiva*, [enlace](url)
              </p>
              <p className="text-xs text-white/40">
                {formData.bio.length}/2000
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informacion de Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className={labelClasses}>
              Telefono (Publico)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email_public" className={labelClasses}>
              Correo (Publico)
            </label>
            <input
              id="email_public"
              name="email_public"
              type="email"
              value={formData.email_public}
              onChange={handleChange}
              placeholder="contact@example.com"
              className={inputClasses}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="website" className={labelClasses}>
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Redes Sociales</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="linkedin_url" className={labelClasses}>
              LinkedIn
            </label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="instagram_url" className={labelClasses}>
              Instagram
            </label>
            <input
              id="instagram_url"
              name="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="facebook_url" className={labelClasses}>
              Facebook
            </label>
            <input
              id="facebook_url"
              name="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={handleChange}
              placeholder="https://facebook.com/username"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Video de Presentacion</h2>
          <button
            type="button"
            role="switch"
            aria-checked={formData.show_video}
            onClick={() => setFormData((prev) => ({ ...prev, show_video: !prev.show_video }))}
            className={`
              relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out
              ${formData.show_video ? 'bg-orange-500' : 'bg-white/20'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg
                transform transition duration-200 ease-in-out
                ${formData.show_video ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
        <div className={formData.show_video ? '' : 'opacity-40 pointer-events-none'}>
          <label htmlFor="video_embed_url" className={labelClasses}>
            URL del Video de YouTube
          </label>
          <input
            id="video_embed_url"
            name="video_embed_url"
            type="url"
            value={formData.video_embed_url}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=xxxxx"
            className={inputClasses}
          />
          <p className="text-xs text-white/40 mt-2">
            Agrega un video de YouTube para presentarte a tus visitantes
          </p>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recursos (Enlaces)</h2>
            <p className="text-sm text-white/50 mt-1">
              Agrega hasta {MAX_RESOURCES} enlaces a recursos, documentos o paginas
            </p>
          </div>
          {visibleResources < MAX_RESOURCES && (
            <button
              type="button"
              onClick={addResource}
              className="
                flex items-center gap-2
                px-4 py-2
                bg-white/10 backdrop-blur-md
                border border-white/20
                rounded-2xl
                text-white text-sm font-medium
                hover:bg-white/20
                transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Enlace
            </button>
          )}
        </div>

        <div className="space-y-4">
          {Array.from({ length: visibleResources }, (_, i) => i + 1).map((num) => (
            <div
              key={num}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
            >
              <div>
                <label
                  htmlFor={`resource_title_${num}`}
                  className={labelClasses}
                >
                  Recurso {num} Titulo
                </label>
                <input
                  id={`resource_title_${num}`}
                  name={`resource_title_${num}`}
                  type="text"
                  value={formData[`resource_title_${num}` as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={`ej., Mi Portafolio`}
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor={`resource_url_${num}`}
                  className={labelClasses}
                >
                  Recurso {num} URL
                </label>
                <input
                  id={`resource_url_${num}`}
                  name={`resource_url_${num}`}
                  type="url"
                  value={formData[`resource_url_${num}` as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>
              {num > DEFAULT_RESOURCES && (
                <div className="flex items-end pb-1">
                  <button
                    type="button"
                    onClick={() => removeResource(num)}
                    className="
                      p-3
                      bg-red-500/10 hover:bg-red-500/20
                      border border-red-500/20
                      rounded-2xl
                      text-red-300 hover:text-red-200
                      transition-all duration-200
                    "
                    title="Remove resource"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {visibleResources < MAX_RESOURCES && (
          <p className="text-xs text-white/40 mt-4 text-center">
            {MAX_RESOURCES - visibleResources} enlace(s) mas{MAX_RESOURCES - visibleResources !== 1 ? 's' : ''} disponible(s)
          </p>
        )}
      </div>


      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || success}
          className={`
            px-8 py-3
            backdrop-blur-md
            font-semibold
            rounded-2xl
            active:scale-[0.98]
            disabled:cursor-not-allowed
            transition-all duration-200
            flex items-center gap-2
            ${success
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }
            ${loading ? 'opacity-50' : ''}
          `}
        >
          {loading && (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {success && (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {loading ? 'Guardando...' : success ? 'Guardado! Abriendo tarjeta...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
