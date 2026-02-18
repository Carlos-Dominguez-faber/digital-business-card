-- Add location field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add Instagram and Facebook social links
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add resources 4-10
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_4 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_4 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_5 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_5 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_6 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_6 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_7 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_7 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_8 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_8 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_9 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_9 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_title_10 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resource_url_10 TEXT;
