-- ============================================================
-- WorshipPresenter — Migration 003: Performance & Search
-- ============================================================

-- ─────────────────────────────────────────────
-- Additional indexes for common query patterns
-- ─────────────────────────────────────────────

-- Songs: sort by created_at for "recently added"
CREATE INDEX IF NOT EXISTS songs_created_at_idx ON songs (created_at DESC);

-- Songs: filter by favorite + title (common combo)
CREATE INDEX IF NOT EXISTS songs_favorite_title_idx ON songs (favorite, title)
  WHERE favorite = true;

-- Service items: fast lookup of all songs in plans
CREATE INDEX IF NOT EXISTS service_items_type_ref_idx ON service_items (type, ref_id)
  WHERE type = 'song';

-- Bible: fast lookup of full chapter (most common query)
CREATE INDEX IF NOT EXISTS bible_chapter_lookup_idx
  ON bible_verses (translation, book_num, chapter, verse);

-- ─────────────────────────────────────────────
-- Add CCLI search to song full-text vector
-- ─────────────────────────────────────────────
-- (Recreate search vector to include ccli_number)
ALTER TABLE songs DROP COLUMN IF EXISTS search_vector;

ALTER TABLE songs ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title,       '') || ' ' ||
      coalesce(artist,      '') || ' ' ||
      coalesce(lyrics,      '') || ' ' ||
      coalesce(ccli_number, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS songs_search_v2_idx ON songs USING GIN (search_vector);

-- ─────────────────────────────────────────────
-- Add soft-delete support to songs
-- (keeps song data for potential recovery)
-- ─────────────────────────────────────────────
ALTER TABLE songs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Exclude deleted songs from default queries
CREATE INDEX IF NOT EXISTS songs_active_idx ON songs (id)
  WHERE deleted_at IS NULL;

-- Update RLS policy to exclude deleted songs from public read
DROP POLICY IF EXISTS "Public read songs" ON songs;
CREATE POLICY "Public read songs" ON songs
  FOR SELECT USING (deleted_at IS NULL);

-- Auth write policy still allows marking deleted
DROP POLICY IF EXISTS "Auth write songs" ON songs;
CREATE POLICY "Auth write songs" ON songs
  FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- Add church profile settings table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS church_settings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key          TEXT NOT NULL UNIQUE,
  value        JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO church_settings (key, value) VALUES
  ('profile',     '{"name":"My Church","timezone":"America/New_York"}'),
  ('output',      '{"showProgressBar":true,"showSectionLabel":true,"logoUrl":""}'),
  ('stage',       '{"showClock":true,"showTimer":true,"showNextSlide":true}'),
  ('translation', '{"default":"NIV","available":["KJV","NIV","ESV"]}')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE church_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON church_settings FOR SELECT USING (true);
CREATE POLICY "Auth write settings"  ON church_settings FOR ALL USING (auth.role() = 'authenticated');
