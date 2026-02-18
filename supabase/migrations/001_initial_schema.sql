-- Digital Business Card Schema
-- Version: 1.0
-- Date: 2026-01-22

-- ============================================
-- PROFILES TABLE (Simplified flat structure)
-- ============================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  job_title TEXT,
  company TEXT,
  bio TEXT,
  -- Contact info (flat fields)
  phone TEXT,
  email_public TEXT,
  website TEXT,
  -- Social links (flat)
  linkedin_url TEXT,
  youtube_channel_url TEXT,
  calendar_url TEXT,
  -- Video
  video_embed_url TEXT,
  -- Resources (up to 3)
  resource_title_1 TEXT,
  resource_url_1 TEXT,
  resource_title_2 TEXT,
  resource_url_2 TEXT,
  resource_title_3 TEXT,
  resource_url_3 TEXT,
  -- GoHighLevel Integration
  ghl_api_key TEXT,
  ghl_location_id TEXT,
  ghl_connected BOOLEAN DEFAULT false,
  ghl_auto_sync BOOLEAN DEFAULT true,
  -- Notification settings
  notify_new_contact BOOLEAN DEFAULT true,
  notify_ghl_sync_fail BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONTACTS TABLE (Captured leads)
-- ============================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Basic info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest_type TEXT NOT NULL,
  message TEXT,
  company TEXT,
  job_title TEXT,
  -- GoHighLevel sync
  ghl_contact_id TEXT,
  ghl_synced_at TIMESTAMPTZ,
  ghl_sync_status TEXT DEFAULT 'pending',
  ghl_sync_attempts INT DEFAULT 0,
  ghl_sync_error TEXT,
  -- Source tracking
  source TEXT DEFAULT 'direct_link',
  card_profile TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location_city TEXT,
  location_country TEXT,
  -- Organization
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EVENTS TABLE (Analytics tracking)
-- ============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  session_id TEXT,
  -- Event details
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  -- Source
  source TEXT,
  -- Device info
  device_type TEXT,
  browser TEXT,
  os TEXT,
  -- Location
  ip_address TEXT,
  location_city TEXT,
  location_country TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SYNC_LOGS TABLE (GHL sync history)
-- ============================================
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_contacts_profile_id ON public.contacts(profile_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX idx_contacts_ghl_sync_status ON public.contacts(ghl_sync_status);
CREATE INDEX idx_events_profile_id ON public.events(profile_id);
CREATE INDEX idx_events_contact_id ON public.events(contact_id);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_session_id ON public.events(session_id);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_sync_logs_contact_id ON public.sync_logs(contact_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profile view for card landing pages
CREATE POLICY "Public can view profiles by username" ON public.profiles
  FOR SELECT USING (username IS NOT NULL);

-- Contacts: Users can only access contacts for their profile
CREATE POLICY "Users can view own contacts" ON public.contacts
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (profile_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Users can update own contacts" ON public.contacts
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own contacts" ON public.contacts
  FOR DELETE USING (profile_id = auth.uid());

-- Anonymous contact submission (public form)
CREATE POLICY "Anyone can submit contacts" ON public.contacts
  FOR INSERT WITH CHECK (true);

-- Events: Users can view events for their profile, anyone can insert
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Anyone can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

-- Sync logs: Users can only view their own
CREATE POLICY "Users can view own sync logs" ON public.sync_logs
  FOR SELECT USING (
    contact_id IN (
      SELECT id FROM public.contacts WHERE profile_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
