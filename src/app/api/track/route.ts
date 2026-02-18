/**
 * Event Tracking API Route
 *
 * POST /api/track - Track user events (clicks, views, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { EventType } from '@/types/database'

interface TrackingEvent {
  profile_id: string
  event_type: EventType
  event_data?: Record<string, unknown>
  contact_id?: string
  session_id?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingEvent = await request.json()

    // Validate required fields
    if (!body.profile_id || !body.event_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get device info from request
    const userAgent = request.headers.get('user-agent') || ''
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Parse device info
    const deviceType = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)

    // Create event
    const { error } = await supabase.from('events').insert({
      profile_id: body.profile_id,
      event_type: body.event_type,
      event_data: body.event_data || {},
      contact_id: body.contact_id || null,
      session_id: body.session_id || getSessionId(request),
      source: 'direct_link',
      device_type: deviceType,
      browser,
      os,
      ip_address: ipAddress,
    })

    if (error) {
      console.error('Error tracking event:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get or generate session ID from cookie
function getSessionId(request: NextRequest): string {
  const sessionId = request.cookies.get('session_id')?.value
  if (sessionId) return sessionId
  return crypto.randomUUID()
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
