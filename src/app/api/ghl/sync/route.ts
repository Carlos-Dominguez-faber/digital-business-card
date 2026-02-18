/**
 * GHL Sync API Route
 *
 * POST /api/ghl/sync - Sync a contact to GoHighLevel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createGHLService } from '@/features/ghl/services/ghl-service'

interface SyncRequest {
  contact_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json()

    if (!body.contact_id) {
      return NextResponse.json(
        { error: 'Missing contact_id' },
        { status: 400 }
      )
    }

    // Use service client to bypass RLS for backend sync operations
    const supabase = createServiceClient()

    // Get contact with profile info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*, profiles(*)')
      .eq('id', body.contact_id)
      .single()

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Get profile for GHL credentials
    const profile = contact.profiles

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if GHL is configured
    if (!profile.ghl_connected || !profile.ghl_api_key || !profile.ghl_location_id) {
      // GHL not configured - mark as skipped
      await supabase
        .from('contacts')
        .update({
          ghl_sync_status: 'pending',
          ghl_sync_error: 'GHL not configured',
        })
        .eq('id', body.contact_id)

      return NextResponse.json({
        success: false,
        error: 'GHL not configured for this profile',
      })
    }

    // Check if auto-sync is enabled
    if (!profile.ghl_auto_sync) {
      return NextResponse.json({
        success: false,
        error: 'Auto-sync disabled',
      })
    }

    // Create GHL service
    const ghlService = createGHLService(profile)

    if (!ghlService) {
      return NextResponse.json(
        { error: 'Failed to create GHL service' },
        { status: 500 }
      )
    }

    // Increment sync attempts
    await supabase
      .from('contacts')
      .update({
        ghl_sync_attempts: contact.ghl_sync_attempts + 1,
      })
      .eq('id', body.contact_id)

    // Sync contact to GHL using Upsert (create or update)
    const result = await ghlService.createContact(contact)

    // Determine sync type based on whether it was a new contact or update
    const syncType = result.isNew ? 'contact_create' : 'contact_update'

    // Log sync attempt
    await supabase.from('sync_logs').insert({
      contact_id: body.contact_id,
      sync_type: syncType,
      status: result.success ? 'success' : 'failed',
      request_payload: { contact_id: body.contact_id, email: contact.email },
      response_payload: result,
      error_message: result.error || null,
    })

    if (result.success) {
      // Update contact with GHL ID
      await supabase
        .from('contacts')
        .update({
          ghl_contact_id: result.ghlContactId,
          ghl_synced_at: new Date().toISOString(),
          ghl_sync_status: 'synced',
          ghl_sync_error: null,
        })
        .eq('id', body.contact_id)

      console.log(`[GHL Sync] Success: ${result.isNew ? 'Created' : 'Updated'} contact ${result.ghlContactId}`)

      return NextResponse.json({
        success: true,
        ghl_contact_id: result.ghlContactId,
        is_new: result.isNew,
      })
    } else {
      // Update contact with error
      await supabase
        .from('contacts')
        .update({
          ghl_sync_status: 'failed',
          ghl_sync_error: result.error,
        })
        .eq('id', body.contact_id)

      return NextResponse.json({
        success: false,
        error: result.error,
      })
    }
  } catch (error) {
    console.error('GHL sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
