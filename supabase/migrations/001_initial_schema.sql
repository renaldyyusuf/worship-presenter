-- ============================================================
-- WorshipPresenter — Initial Schema Migration
-- Run: supabase db push
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- trigram for fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- accent-insensitive search

-- ─────────────────────────────────────────────────────────────
-- THEMES (must come before songs since songs FK to themes)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS themes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  font_family       TEXT NOT NULL DEFAULT 'Inter',
  font_size         INTEGER NOT NULL DEFAULT 52,
  font_weight       INTEGER NOT NULL DEFAULT 600,
  text_align        TEXT NOT NULL DEFAULT 'center' CHECK (text_align IN ('left', 'center', 'right')),
  text_position     TEXT NOT NULL DEFAULT 'middle' CHECK (text_position IN ('top', 'middle', 'bottom')),
  text_color        TEXT NOT NULL DEFAULT '#ffffff',
  text_shadow       JSONB NOT NULL DEFAULT '{"enabled":true,"x":2,"y":2,"blur":8,"color":"rgba(0,0,0,0.8)"}',
  text_stroke       JSONB NOT NULL DEFAULT '{"enabled":false,"width":0,"color":"#000000"}',
  background_opacity FLOAT NOT NULL DEFAULT 0.5 CHECK (background_opacity BETWEEN 0 AND 1),
  line_height       FLOAT NOT NULL DEFAULT 1.4,
  letter_spacing    FLOAT NOT NULL DEFAULT 0,
  is_default        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one default theme allowed
CREATE UNIQUE INDEX unique_default_theme ON themes (is_default) WHERE is_default = true;

-- Seed default theme
INSERT INTO themes (name, is_default) VALUES ('Default', true);

-- ─────────────────────────────────────────────────────────────
-- SONGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS songs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  artist       TEXT,
  album        TEXT,
  year         INTEGER,
  ccli_number  TEXT,
  copyright    TEXT,
  lyrics       TEXT NOT NULL DEFAULT '',
  sections     JSONB NOT NULL DEFAULT '[]',   -- LyricsSection[]
  slides       JSONB NOT NULL DEFAULT '[]',   -- Slide[]
  tags         TEXT[] NOT NULL DEFAULT '{}',
  category     TEXT,
  favorite     BOOLEAN NOT NULL DEFAULT false,
  theme_id     UUID REFERENCES themes(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX songs_title_trgm_idx   ON songs USING GIN (title gin_trgm_ops);
CREATE INDEX songs_artist_trgm_idx  ON songs USING GIN (artist gin_trgm_ops);
CREATE INDEX songs_lyrics_trgm_idx  ON songs USING GIN (lyrics gin_trgm_ops);
CREATE INDEX songs_tags_idx         ON songs USING GIN (tags);
CREATE INDEX songs_favorite_idx     ON songs (favorite) WHERE favorite = true;
CREATE INDEX songs_category_idx     ON songs (category);

-- Full-text search vector
ALTER TABLE songs ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(artist, '') || ' ' ||
      coalesce(lyrics, '')
    )
  ) STORED;

CREATE INDEX songs_search_idx ON songs USING GIN (search_vector);

-- ─────────────────────────────────────────────────────────────
-- BIBLE VERSES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bible_verses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation TEXT NOT NULL,
  book        TEXT NOT NULL,
  book_num    INTEGER NOT NULL,
  chapter     INTEGER NOT NULL,
  verse       INTEGER NOT NULL,
  content     TEXT NOT NULL,

  UNIQUE (translation, book_num, chapter, verse)
);

-- Indexes for common queries
CREATE INDEX bible_reference_idx ON bible_verses (translation, book_num, chapter, verse);
CREATE INDEX bible_book_idx      ON bible_verses (book, chapter, verse);

-- Full-text index for keyword search
ALTER TABLE bible_verses ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('english', unaccent(content))
  ) STORED;

CREATE INDEX bible_search_idx ON bible_verses USING GIN (search_vector);

-- Helper function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_bible_fulltext(
  query       TEXT,
  translation TEXT DEFAULT 'NIV',
  max_results INTEGER DEFAULT 20
)
RETURNS SETOF bible_verses
LANGUAGE SQL STABLE AS $$
  SELECT *
  FROM bible_verses
  WHERE
    bible_verses.translation = search_bible_fulltext.translation
    AND search_vector @@ plainto_tsquery('english', unaccent(query))
  ORDER BY
    ts_rank(search_vector, plainto_tsquery('english', unaccent(query))) DESC
  LIMIT max_results;
$$;

-- ─────────────────────────────────────────────────────────────
-- MEDIA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('image', 'video', 'loop', 'audio')),
  storage_path   TEXT NOT NULL UNIQUE,
  cdn_url        TEXT NOT NULL,
  mime_type      TEXT NOT NULL,
  size_bytes     BIGINT NOT NULL DEFAULT 0,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url  TEXT,
  width          INTEGER,
  height         INTEGER,
  duration_sec   FLOAT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX media_type_idx ON media (type);
CREATE INDEX media_tags_idx ON media USING GIN (tags);
CREATE INDEX media_name_trgm_idx ON media USING GIN (name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────
-- SERVICE PLANS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_plans (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  service_date  DATE NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX service_plans_date_idx ON service_plans (service_date DESC);

-- ─────────────────────────────────────────────────────────────
-- SERVICE ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id        UUID NOT NULL REFERENCES service_plans(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('song', 'bible', 'video', 'image', 'announcement', 'blank')),
  ref_id         UUID,                     -- points to songs.id or media.id
  title          TEXT NOT NULL,
  subtitle       TEXT,
  notes          TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  duration_min   INTEGER,
  slides         JSONB,                    -- cached Slide[] for bible items
  thumbnail_url  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX service_items_plan_idx  ON service_items (plan_id, sort_order);
CREATE INDEX service_items_ref_idx   ON service_items (ref_id) WHERE ref_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER (reusable for all tables)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER service_plans_updated_at
  BEFORE UPDATE ON service_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- (Enable per-org once auth is wired up. 
--  For now: open read, authenticated write.)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE songs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE media          ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes         ENABLE ROW LEVEL SECURITY;

-- Public read for all (presentation screens need this without auth)
CREATE POLICY "Public read songs"         ON songs         FOR SELECT USING (true);
CREATE POLICY "Public read bible"         ON bible_verses  FOR SELECT USING (true);
CREATE POLICY "Public read media"         ON media         FOR SELECT USING (true);
CREATE POLICY "Public read service plans" ON service_plans FOR SELECT USING (true);
CREATE POLICY "Public read service items" ON service_items FOR SELECT USING (true);
CREATE POLICY "Public read themes"        ON themes        FOR SELECT USING (true);

-- Authenticated write
CREATE POLICY "Auth write songs"          ON songs         FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write media"          ON media         FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write service plans"  ON service_plans FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write service items"  ON service_items FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write themes"         ON themes        FOR ALL    USING (auth.role() = 'authenticated');
