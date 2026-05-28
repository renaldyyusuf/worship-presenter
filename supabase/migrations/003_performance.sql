-- ============================================================
-- WorshipPresenter — Migration 003: Performance & Settings
-- Paste into Supabase SQL Editor and click Run
-- ============================================================

-- ─────────────────────────────────────────────
-- Additional performance indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS songs_created_at_idx ON songs (created_at DESC);

CREATE INDEX IF NOT EXISTS songs_favorite_title_idx ON songs (favorite, title)
  WHERE favorite = true;

CREATE INDEX IF NOT EXISTS service_items_type_ref_idx ON service_items (type, ref_id)
  WHERE type = 'song';

CREATE INDEX IF NOT EXISTS bible_chapter_lookup_idx
  ON bible_verses (translation, book_num, chapter, verse);

-- ─────────────────────────────────────────────
-- Church settings table
-- (skip if already exists from migration 001)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings (safe to run multiple times)
INSERT INTO church_settings (key, value) VALUES
  ('profile',     '{"name":"My Church","timezone":"America/New_York","logoUrl":""}'),
  ('output',      '{"showProgressBar":true,"showSectionLabel":true,"showSlideNumber":false,"logoUrl":""}'),
  ('stage',       '{"showClock":true,"showTimer":true,"showNextSlide":true,"showMessage":true}'),
  ('translation', '{"default":"KJV","available":["KJV","NIV","ESV","WEB"]}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies first to avoid "already exists" error, then recreate
DROP POLICY IF EXISTS "Public read settings"  ON church_settings;
DROP POLICY IF EXISTS "Auth write settings"   ON church_settings;

CREATE POLICY "Public read settings"  ON church_settings FOR SELECT USING (true);
CREATE POLICY "Auth write settings"   ON church_settings FOR ALL    USING (auth.role() = 'authenticated');
