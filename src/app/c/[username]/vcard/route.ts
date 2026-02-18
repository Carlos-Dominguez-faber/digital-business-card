/**
 * VCF Download API Route
 *
 * GET /c/[username]/vcard
 *
 * Downloads an iOS-compatible VCF file for the user's profile.
 * This is the primary contact-saving method for iPhone users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVcfFromProfile, generateVcfFilename } from '@/features/card/services/vcf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const supabase = await createClient()

    // Fetch profile by username
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Generate VCF content
    const vcfContent = await generateVcfFromProfile(profile)
    const filename = generateVcfFilename(profile.full_name)

    // Track VCF download event
    const sessionId = request.cookies.get('session_id')?.value || crypto.randomUUID()
    await supabase.from('events').insert({
      profile_id: profile.id,
      event_type: 'vcf_download',
      session_id: sessionId,
      source: request.headers.get('referer')?.includes('qr') ? 'qr_scan' : 'direct_link',
      device_type: getDeviceType(request.headers.get('user-agent') || ''),
      browser: getBrowser(request.headers.get('user-agent') || ''),
      os: getOS(request.headers.get('user-agent') || ''),
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
    })

    // Return VCF file with proper headers for iOS
    return new NextResponse(vcfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error generating VCF:', error)
    return NextResponse.json(
      { error: 'Failed to generate contact file' },
      { status: 500 }
    )
  }
}

// Helper functions to parse user agent
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari'
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('edge')) return 'Edge'
  return 'Other'
}

function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('mac')) return 'macOS'
  if (ua.includes('windows')) return 'Windows'
  return 'Other'
}
