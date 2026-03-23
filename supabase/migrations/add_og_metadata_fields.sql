-- Migration: Add Open Graph and SEO metadata fields
-- Purpose: Support social sharing with proper meta-tags
-- Date: 2026-03-23

-- ─── culture_sections table ────────────────────────────────────────────────────

-- Add SEO title (used for og:title on social share)
ALTER TABLE culture_sections
ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT NULL;

-- Add SEO description (used for og:description on social share)
ALTER TABLE culture_sections
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_culture_sections_slug ON culture_sections(slug);

-- ─── site_metadata table ──────────────────────────────────────────────────────

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_metadata (
  id BIGSERIAL PRIMARY KEY,
  page_slug TEXT UNIQUE NOT NULL,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add missing columns if table exists
ALTER TABLE site_metadata
ADD COLUMN IF NOT EXISTS og_title TEXT;

ALTER TABLE site_metadata
ADD COLUMN IF NOT EXISTS og_description TEXT;

ALTER TABLE site_metadata
ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE site_metadata
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website';

ALTER TABLE site_metadata
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image';

-- ─── Initial data for site_metadata ────────────────────────────────────────────

-- Home page
INSERT INTO site_metadata (page_slug, og_title, og_description, og_type)
VALUES (
  'home',
  'Thai Akha Kitchen — Discover Culture & Flavor',
  'Explore the authentic flavors, stories, and traditions of Akha culture through classes, recipes, and cultural journeys.',
  'website'
)
ON CONFLICT (page_slug) DO UPDATE SET
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;

-- Recipes page
INSERT INTO site_metadata (page_slug, og_title, og_description, og_type)
VALUES (
  'recipes',
  'Traditional Akha Recipes — Authentic Flavors',
  'Discover traditional and modern Akha recipes. Learn cooking techniques and cultural stories behind each dish.',
  'website'
)
ON CONFLICT (page_slug) DO UPDATE SET
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;

-- Classes page
INSERT INTO site_metadata (page_slug, og_title, og_description, og_type)
VALUES (
  'classes',
  'Akha Cooking & Culture Classes',
  'Experience authentic Akha cooking classes and cultural workshops. Learn from experienced instructors.',
  'website'
)
ON CONFLICT (page_slug) DO UPDATE SET
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;

-- History/Culture page
INSERT INTO site_metadata (page_slug, og_title, og_description, og_type)
VALUES (
  'history',
  'Akha Culture & History — Stories & Traditions',
  'Explore the rich heritage, traditions, and history of the Akha people.',
  'website'
)
ON CONFLICT (page_slug) DO UPDATE SET
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;

-- Booking page
INSERT INTO site_metadata (page_slug, og_title, og_description, og_type)
VALUES (
  'booking',
  'Book Your Akha Experience',
  'Reserve your spot for authentic Akha cooking classes and cultural experiences.',
  'website'
)
ON CONFLICT (page_slug) DO UPDATE SET
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;

-- ─── Enable RLS (Row Level Security) if needed ─────────────────────────────────

-- For site_metadata, typically read-only for public
ALTER TABLE site_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable public read on site_metadata"
  ON site_metadata
  FOR SELECT
  USING (true);

-- Restrict write to authenticated admin only (if admin_users table exists)
-- CREATE POLICY "Enable admin insert/update on site_metadata"
--   ON site_metadata
--   FOR INSERT
--   WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users))
--   AS PERMISSIVE;

-- ─── Grant permissions ────────────────────────────────────────────────────────

-- Allow service role (Edge Function) to read
GRANT SELECT ON site_metadata TO service_role;
GRANT SELECT ON culture_sections TO service_role;
GRANT SELECT ON media_assets TO service_role;

COMMIT;
