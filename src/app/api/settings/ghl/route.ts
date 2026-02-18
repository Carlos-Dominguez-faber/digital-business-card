import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log('=== GHL SETTINGS API ===')
    console.log('User ID:', user.id)
    console.log('API Key provided:', !!body.ghl_api_key)
    console.log('Location ID:', body.ghl_location_id)
    console.log('Connected status:', body.ghl_connected)

    // Use the verified connection status from frontend, or false if not provided
    const isConnected = body.ghl_connected === true

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    let updatedProfile

    if (!existingProfile) {
      // Profile doesn't exist - create it with GHL settings
      console.log('Profile does not exist, creating new profile...')
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          ghl_api_key: body.ghl_api_key || null,
          ghl_location_id: body.ghl_location_id || null,
          ghl_auto_sync: body.ghl_auto_sync ?? true,
          ghl_connected: isConnected,
        })
        .select('ghl_api_key, ghl_location_id, ghl_connected')
        .single()

      if (error) {
        console.error('Profile creation error:', error)
        return NextResponse.json(
          { error: 'Failed to create profile: ' + error.message },
          { status: 500 }
        )
      }
      updatedProfile = data
    } else {
      // Profile exists - update it
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ghl_api_key: body.ghl_api_key || null,
          ghl_location_id: body.ghl_location_id || null,
          ghl_auto_sync: body.ghl_auto_sync ?? true,
          ghl_connected: isConnected,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('ghl_api_key, ghl_location_id, ghl_connected')
        .single()

      if (error) {
        console.error('GHL settings update error:', error)
        return NextResponse.json(
          { error: 'Failed to update settings: ' + error.message },
          { status: 500 }
        )
      }
      updatedProfile = data
    }

    if (!updatedProfile) {
      console.error('GHL update returned no data - RLS may be blocking')
      return NextResponse.json(
        { error: 'Failed to save GHL settings. Please try logging out and back in.' },
        { status: 500 }
      )
    }

    console.log('GHL settings saved successfully')
    console.log('Saved API Key exists:', !!updatedProfile.ghl_api_key)
    console.log('Saved Location ID:', updatedProfile.ghl_location_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GHL settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
