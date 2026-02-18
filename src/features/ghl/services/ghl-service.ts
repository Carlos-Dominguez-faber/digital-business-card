/**
 * GoHighLevel Integration Service
 *
 * Handles syncing contacts to GoHighLevel CRM via their API v2.
 *
 * API Docs: https://highlevel.stoplight.io/docs/integrations
 */

import type { Contact, Profile } from '@/types/database'

const GHL_API_BASE = 'https://services.leadconnectorhq.com'

interface GHLContact {
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phone?: string
  companyName?: string
  source?: string
  tags?: string[]
  customFields?: Array<{
    id?: string
    key?: string
    field_value: string
  }>
}

interface GHLCreateContactResponse {
  contact: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
}

interface GHLError {
  message: string
  statusCode: number
}

export class GoHighLevelService {
  private apiKey: string
  private locationId: string

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey
    this.locationId = locationId
  }

  /**
   * Create or update a contact in GoHighLevel using Upsert API
   *
   * Uses the /contacts/upsert endpoint which automatically:
   * - Checks for existing contacts based on location's duplicate settings
   * - Creates new contact if not found
   * - Updates existing contact if found (by email or phone)
   *
   * @see https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact
   */
  async createContact(contact: Contact): Promise<{ success: boolean; ghlContactId?: string; error?: string; isNew?: boolean }> {
    try {
      // Split full name into first and last
      const nameParts = contact.full_name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Map interest type to readable label
      const interestLabel = mapInterestType(contact.interest_type)

      // Build contact payload for upsert
      const ghlContact: GHLContact & { locationId: string } = {
        locationId: this.locationId,
        firstName,
        lastName,
        email: contact.email,
        phone: contact.phone || undefined,
        source: 'Tarjeta Digital',
        tags: ['digital-card'],
        customFields: [
          {
            key: 'interest_type',
            field_value: interestLabel,
          },
        ],
      }

      // Add company if available from contact
      if (contact.company) {
        ghlContact.companyName = contact.company
      }

      // Add message as a custom field if provided
      if (contact.message) {
        ghlContact.customFields?.push({
          key: 'initial_message',
          field_value: contact.message,
        })
      }

      // Add source tracking
      if (contact.source) {
        ghlContact.customFields?.push({
          key: 'contact_source',
          field_value: contact.source,
        })
      }

      console.log('[GHL] Upserting contact:', { email: contact.email, locationId: this.locationId })

      // Use Upsert API - automatically handles duplicate detection
      const response = await fetch(`${GHL_API_BASE}/contacts/upsert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(ghlContact),
      })

      const responseText = await response.text()
      console.log('[GHL] Upsert response:', response.status, responseText)

      if (!response.ok) {
        let errorMessage = `GHL API error: ${response.status}`
        try {
          const error = JSON.parse(responseText)
          errorMessage = error.message || error.error || errorMessage
        } catch {
          // Response wasn't JSON
        }
        return {
          success: false,
          error: errorMessage,
        }
      }

      const data = JSON.parse(responseText)

      // Upsert returns { contact: { id, ... }, new: boolean }
      return {
        success: true,
        ghlContactId: data.contact?.id,
        isNew: data.new ?? true,
      }
    } catch (error) {
      console.error('[GHL] createContact error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Find a contact by email
   */
  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const response = await fetch(
        `${GHL_API_BASE}/contacts/search/duplicate?locationId=${this.locationId}&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Version': '2021-07-28',
          },
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (data.contact?.id) {
        return { id: data.contact.id }
      }

      return null
    } catch (error) {
      console.error('GHL findContactByEmail error:', error)
      return null
    }
  }

  /**
   * Update an existing contact
   */
  async updateContact(
    contactId: string,
    updates: Partial<GHLContact>
  ): Promise<{ success: boolean; ghlContactId?: string; error?: string }> {
    try {
      const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error: GHLError = await response.json()
        return {
          success: false,
          error: error.message || `GHL API error: ${response.status}`,
        }
      }

      return {
        success: true,
        ghlContactId: contactId,
      }
    } catch (error) {
      console.error('GHL updateContact error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Add a note to a contact (for activity tracking)
   */
  async addContactNote(contactId: string, note: string): Promise<boolean> {
    try {
      const response = await fetch(`${GHL_API_BASE}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          body: note,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('GHL addContactNote error:', error)
      return false
    }
  }

  /**
   * Test connection to GoHighLevel
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${GHL_API_BASE}/locations/${this.locationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Version': '2021-07-28',
          },
        }
      )

      if (!response.ok) {
        return {
          success: false,
          error: `Connection failed: ${response.status}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }
}

/**
 * Map interest type to readable label
 */
function mapInterestType(interestType: string): string {
  const map: Record<string, string> = {
    networking: 'Networking',
    contratar_servicios: 'Contratar Servicios',
    podcast: 'Podcast',
    colaboracion: 'Colaboración',
    oportunidades_negocio: 'Oportunidades de Negocio',
    ofrecer_servicios: 'Ofrecer Servicios',
  }
  return map[interestType] || interestType
}

/**
 * Create GHL service from profile
 */
export function createGHLService(profile: Profile): GoHighLevelService | null {
  if (!profile.ghl_api_key || !profile.ghl_location_id) {
    return null
  }
  return new GoHighLevelService(profile.ghl_api_key, profile.ghl_location_id)
}
