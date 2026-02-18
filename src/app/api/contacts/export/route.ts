import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all contacts for the user
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json(
        { error: 'Failed to export contacts' },
        { status: 500 }
      )
    }

    // Generate CSV
    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Company',
      'Interest Type',
      'Message',
      'GHL Status',
      'Created At',
    ]

    const rows = contacts?.map((contact) => [
      escapeCsvValue(contact.full_name),
      escapeCsvValue(contact.email),
      escapeCsvValue(contact.phone || ''),
      escapeCsvValue(contact.company || ''),
      escapeCsvValue(formatInterestType(contact.interest_type)),
      escapeCsvValue(contact.message || ''),
      escapeCsvValue(contact.ghl_sync_status),
      escapeCsvValue(new Date(contact.created_at).toISOString()),
    ])

    const csv = [
      headers.join(','),
      ...(rows || []).map((row) => row.join(',')),
    ].join('\n')

    // Return CSV file
    const filename = `contacts-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function escapeCsvValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatInterestType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
