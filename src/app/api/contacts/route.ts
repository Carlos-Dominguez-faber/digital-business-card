/**
 * Contacts API Route
 *
 * POST /api/contacts - Create a new contact from exchange form
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { InterestType } from '@/types/database'

interface ContactSubmission {
  profile_id: string
  full_name: string
  email: string
  phone?: string
  interest_type: InterestType
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactSubmission = await request.json()

    // Validate required fields
    if (!body.profile_id || !body.full_name || !body.email || !body.interest_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get device info from request
    const userAgent = request.headers.get('user-agent') || ''
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Create contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        profile_id: body.profile_id,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        interest_type: body.interest_type,
        message: body.message || null,
        source: 'direct_link',
        ip_address: ipAddress,
        user_agent: userAgent,
        ghl_sync_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json(
        { error: 'Failed to save contact' },
        { status: 500 }
      )
    }

    // Track form submission event
    await supabase.from('events').insert({
      profile_id: body.profile_id,
      contact_id: contact.id,
      event_type: 'form_submit',
      event_data: { interest_type: body.interest_type },
      ip_address: ipAddress,
    })

    // Trigger GHL sync synchronously (must complete before response returns on Vercel)
    const syncResult = await syncToGoHighLevel(contact.id)
    console.log('[Contact API] Sync result:', syncResult)

    return NextResponse.json({
      success: true,
      contact_id: contact.id,
      ghl_sync: syncResult,
    })
  } catch (error) {
    console.error('Error in contacts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Sync contact to GoHighLevel (synchronous - must complete before response returns)
async function syncToGoHighLevel(contactId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[GHL Sync] Starting sync for contact: ${contactId}`)

    // Construct URL with proper fallback
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000'

    console.log(`[GHL Sync] Using base URL: ${baseUrl}`)

    // Call the GHL sync endpoint
    const response = await fetch(`${baseUrl}/api/ghl/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId }),
    })

    const result = await response.json()
    console.log(`[GHL Sync] Result:`, result)

    if (!result.success) {
      console.error(`[GHL Sync] Sync failed:`, result.error)
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error('[GHL Sync] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
