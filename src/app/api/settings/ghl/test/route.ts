import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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
    const { ghl_api_key, ghl_location_id } = body

    if (!ghl_api_key || !ghl_location_id) {
      return NextResponse.json(
        { error: 'API Key and Location ID are required' },
        { status: 400 }
      )
    }

    // Test the GHL connection by fetching location info
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${ghl_location_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghl_api_key}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('GHL test error:', errorData)

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API Key' },
          { status: 400 }
        )
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Location not found. Check your Location ID.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Connection failed. Please check your credentials.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Connection successful!'
    })
  } catch (error) {
    console.error('GHL test API error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to GoHighLevel' },
      { status: 500 }
    )
  }
}
