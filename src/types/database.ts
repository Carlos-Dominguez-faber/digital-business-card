// Digital Business Card Database Types
// Generated from Supabase schema

export interface Profile {
  id: string
  email: string
  username: string | null
  full_name: string
  photo_url: string | null
  job_title: string | null
  company: string | null
  location: string | null
  bio: string | null
  // Contact info (flat fields for personal card)
  phone: string | null
  email_public: string | null
  website: string | null
  // Social links (flat for personal card)
  linkedin_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  // Legacy fields (kept for backwards compatibility)
  youtube_channel_url: string | null
  calendar_url: string | null
  // Video
  video_embed_url: string | null
  show_video: boolean
  // Resources (flat for personal card - up to 10)
  resource_title_1: string | null
  resource_url_1: string | null
  resource_title_2: string | null
  resource_url_2: string | null
  resource_title_3: string | null
  resource_url_3: string | null
  resource_title_4: string | null
  resource_url_4: string | null
  resource_title_5: string | null
  resource_url_5: string | null
  resource_title_6: string | null
  resource_url_6: string | null
  resource_title_7: string | null
  resource_url_7: string | null
  resource_title_8: string | null
  resource_url_8: string | null
  resource_title_9: string | null
  resource_url_9: string | null
  resource_title_10: string | null
  resource_url_10: string | null
  // GoHighLevel Integration
  ghl_api_key: string | null
  ghl_location_id: string | null
  ghl_connected: boolean
  ghl_auto_sync: boolean
  // Notification settings
  notify_new_contact: boolean
  notify_ghl_sync_fail: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

// Contact types

export interface Contact {
  id: string
  profile_id: string
  // Basic info
  full_name: string
  email: string
  phone: string | null
  interest_type: InterestType
  message: string | null
  company: string | null
  job_title: string | null
  // GHL sync
  ghl_contact_id: string | null
  ghl_synced_at: string | null
  ghl_sync_status: 'pending' | 'synced' | 'failed'
  ghl_sync_attempts: number
  ghl_sync_error: string | null
  // Source tracking
  source: 'qr_scan' | 'nfc_tap' | 'direct_link' | 'share'
  card_profile: string | null
  ip_address: string | null
  user_agent: string | null
  location_city: string | null
  location_country: string | null
  // Organization
  tags: string[]
  notes: string | null
  is_favorite: boolean
  // Timestamps
  created_at: string
  updated_at: string
}

export type InterestType =
  | 'networking'
  | 'contratar_servicios'
  | 'podcast'
  | 'colaboracion'
  | 'oportunidades_negocio'
  | 'ofrecer_servicios'

export const INTEREST_OPTIONS: { value: InterestType; label: string }[] = [
  { value: 'networking', label: 'Networking' },
  { value: 'contratar_servicios', label: 'Contratar Servicios' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'colaboracion', label: 'Colaboración' },
  { value: 'oportunidades_negocio', label: 'Oportunidades de Negocio' },
  { value: 'ofrecer_servicios', label: 'Ofrecer Servicios' },
]

export interface Event {
  id: string
  profile_id: string
  contact_id: string | null
  session_id: string | null
  // Event details
  event_type: EventType
  event_data: Record<string, unknown>
  // Source
  source: string | null
  // Device info
  device_type: 'mobile' | 'tablet' | 'desktop' | null
  browser: string | null
  os: string | null
  // Location
  ip_address: string | null
  location_city: string | null
  location_country: string | null
  // Timestamps
  created_at: string
}

export type EventType =
  | 'page_view'
  | 'vcf_download'
  | 'qr_scan'
  | 'email_click'
  | 'phone_click'
  | 'website_click'
  | 'social_click'
  | 'video_view'
  | 'pdf_download'
  | 'form_open'
  | 'form_submit'
  | 'contact_saved'

export interface SyncLog {
  id: string
  contact_id: string
  sync_type: 'contact_create' | 'contact_update' | 'activity_sync'
  status: 'success' | 'failed'
  request_payload: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  error_message: string | null
  created_at: string
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: never
      }
      sync_logs: {
        Row: SyncLog
        Insert: Omit<SyncLog, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
