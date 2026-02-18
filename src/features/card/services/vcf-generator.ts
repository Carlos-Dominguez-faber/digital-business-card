/**
 * VCF Generator - iOS Compatible
 *
 * CRITICAL: This generates VCF files that work reliably on iPhone Safari.
 *
 * iOS VCF Requirements:
 * - VERSION must be 3.0 (not 4.0)
 * - PHOTO must be base64 encoded, not URL
 * - Line breaks must be CRLF (\r\n)
 * - Lines > 75 chars must have folding
 * - Content-Type: text/vcard; charset=utf-8
 * - Filename: lowercase with underscores, .vcf extension
 */

import type { Profile } from '@/types/database'

interface VCardData {
  fullName: string
  firstName?: string
  lastName?: string
  company?: string
  title?: string
  email?: string
  phone?: string
  website?: string
  bio?: string
  photoBase64?: string
  location?: string
  // Social links
  linkedin?: string
  instagram?: string
  facebook?: string
  youtube?: string
  calendar?: string
  // Resources (additional URLs)
  resources?: { title: string; url: string }[]
}

// Fold lines longer than 75 characters (VCF spec requirement)
function foldLine(line: string): string {
  if (line.length <= 75) return line

  const chunks: string[] = []
  let remaining = line

  // First line can be 75 chars
  chunks.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)

  // Continuation lines start with space and can be 74 chars
  while (remaining.length > 0) {
    chunks.push(' ' + remaining.slice(0, 74))
    remaining = remaining.slice(74)
  }

  return chunks.join('\r\n')
}

// Escape special characters in VCF values
function escapeVcfValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// Convert image URL to base64 (for embedding in VCF)
export async function imageToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return base64
  } catch (error) {
    console.error('Error converting image to base64:', error)
    return null
  }
}

// Generate VCF content from profile data
export function generateVcf(data: VCardData): string {
  const lines: string[] = []

  // VCF Header - VERSION 3.0 is critical for iOS compatibility
  lines.push('BEGIN:VCARD')
  lines.push('VERSION:3.0')

  // Name fields
  const firstName = data.firstName || data.fullName.split(' ')[0] || ''
  const lastName = data.lastName || data.fullName.split(' ').slice(1).join(' ') || ''

  lines.push(`FN:${escapeVcfValue(data.fullName)}`)
  lines.push(`N:${escapeVcfValue(lastName)};${escapeVcfValue(firstName)};;;`)

  // Organization and title
  if (data.company) {
    lines.push(`ORG:${escapeVcfValue(data.company)}`)
  }
  if (data.title) {
    lines.push(`TITLE:${escapeVcfValue(data.title)}`)
  }

  // Contact information
  if (data.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email}`)
  }
  if (data.phone) {
    // Format phone for VCF - remove spaces and ensure + prefix for international
    const formattedPhone = data.phone.replace(/[\s()-]/g, '')
    lines.push(`TEL;TYPE=CELL:${formattedPhone}`)
  }

  // Website (primary)
  if (data.website) {
    lines.push(`URL;TYPE=WORK:${data.website}`)
  }

  // Location/Address
  if (data.location) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVcfValue(data.location)};;;;`)
  }

  // Social profiles - using itemN.URL + itemN.X-ABLabel for iOS visibility
  // This format shows labeled URLs prominently in iOS Contacts
  let itemIndex = 1

  if (data.linkedin) {
    lines.push(`item${itemIndex}.URL:${data.linkedin}`)
    lines.push(`item${itemIndex}.X-ABLabel:LinkedIn`)
    itemIndex++
  }
  if (data.instagram) {
    lines.push(`item${itemIndex}.URL:${data.instagram}`)
    lines.push(`item${itemIndex}.X-ABLabel:Instagram`)
    itemIndex++
  }
  if (data.facebook) {
    lines.push(`item${itemIndex}.URL:${data.facebook}`)
    lines.push(`item${itemIndex}.X-ABLabel:Facebook`)
    itemIndex++
  }
  if (data.youtube) {
    lines.push(`item${itemIndex}.URL:${data.youtube}`)
    lines.push(`item${itemIndex}.X-ABLabel:YouTube`)
    itemIndex++
  }
  if (data.calendar) {
    lines.push(`item${itemIndex}.URL:${data.calendar}`)
    lines.push(`item${itemIndex}.X-ABLabel:Calendar`)
    itemIndex++
  }

  // Resources as labeled URLs
  if (data.resources && data.resources.length > 0) {
    data.resources.forEach((resource) => {
      lines.push(`item${itemIndex}.URL:${resource.url}`)
      lines.push(`item${itemIndex}.X-ABLabel:${escapeVcfValue(resource.title)}`)
      itemIndex++
    })
  }

  // Photo - MUST be base64 encoded for iOS
  if (data.photoBase64) {
    // Split base64 into multiple lines for VCF compliance
    const photoLine = `PHOTO;ENCODING=b;TYPE=JPEG:${data.photoBase64}`
    lines.push(foldLine(photoLine))
  }

  // Note/Bio - with proper line folding for long text
  if (data.bio) {
    // Increase limit to 2000 chars to preserve more content
    const truncatedBio = data.bio.slice(0, 2000)
    const noteLine = `NOTE:${escapeVcfValue(truncatedBio)}`
    // Apply line folding for VCF compliance (lines > 75 chars)
    lines.push(foldLine(noteLine))
  }

  // VCF Footer
  lines.push('END:VCARD')

  // Join with CRLF (required by VCF spec)
  return lines.join('\r\n')
}

// Generate VCF from Profile object
export async function generateVcfFromProfile(profile: Profile): Promise<string> {
  // Convert photo to base64 if available
  let photoBase64: string | undefined
  if (profile.photo_url) {
    const base64 = await imageToBase64(profile.photo_url)
    if (base64) {
      photoBase64 = base64
    }
  }

  // Collect resources into array
  const resources: { title: string; url: string }[] = []
  const resourceFields = [
    { title: profile.resource_title_1, url: profile.resource_url_1 },
    { title: profile.resource_title_2, url: profile.resource_url_2 },
    { title: profile.resource_title_3, url: profile.resource_url_3 },
    { title: profile.resource_title_4, url: profile.resource_url_4 },
    { title: profile.resource_title_5, url: profile.resource_url_5 },
    { title: profile.resource_title_6, url: profile.resource_url_6 },
    { title: profile.resource_title_7, url: profile.resource_url_7 },
    { title: profile.resource_title_8, url: profile.resource_url_8 },
    { title: profile.resource_title_9, url: profile.resource_url_9 },
    { title: profile.resource_title_10, url: profile.resource_url_10 },
  ]
  resourceFields.forEach(({ title, url }) => {
    if (title && url) {
      resources.push({ title, url })
    }
  })

  return generateVcf({
    fullName: profile.full_name,
    company: profile.company || undefined,
    title: profile.job_title || undefined,
    email: profile.email_public || profile.email,
    phone: profile.phone || undefined,
    website: profile.website || undefined,
    bio: profile.bio || undefined,
    photoBase64,
    location: profile.location || undefined,
    linkedin: profile.linkedin_url || undefined,
    instagram: profile.instagram_url || undefined,
    facebook: profile.facebook_url || undefined,
    youtube: profile.youtube_channel_url || undefined,
    calendar: profile.calendar_url || undefined,
    resources: resources.length > 0 ? resources : undefined,
  })
}

// Generate filename for VCF download
export function generateVcfFilename(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '.vcf'
}

// Generate QR code data for vCard (alternative method for iPhone Camera)
export function generateVcardQrData(data: VCardData): string {
  // Simplified vCard for QR (no photo to keep size small)
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName}`,
  ]

  if (data.company) lines.push(`ORG:${data.company}`)
  if (data.title) lines.push(`TITLE:${data.title}`)
  if (data.email) lines.push(`EMAIL:${data.email}`)
  if (data.phone) lines.push(`TEL:${data.phone.replace(/[\s()-]/g, '')}`)
  if (data.website) lines.push(`URL:${data.website}`)
  if (data.location) lines.push(`ADR:;;${data.location};;;;`)

  // Social profiles with iOS-compatible format
  let itemIndex = 1
  if (data.linkedin) {
    lines.push(`item${itemIndex}.URL:${data.linkedin}`)
    lines.push(`item${itemIndex}.X-ABLabel:LinkedIn`)
    itemIndex++
  }
  if (data.instagram) {
    lines.push(`item${itemIndex}.URL:${data.instagram}`)
    lines.push(`item${itemIndex}.X-ABLabel:Instagram`)
  }

  lines.push('END:VCARD')

  return lines.join('\n')
}
