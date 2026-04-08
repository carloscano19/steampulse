-- ============================================================
-- StreamPulse: Gaming Domain Tables
-- Migration 001 - Games + YouTube Cache
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: games
-- Source: IGDB API v4
-- Cache TTL: 7 days
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  igdb_id       INTEGER       UNIQUE NOT NULL,
  slug          TEXT          UNIQUE NOT NULL,
  name          TEXT          NOT NULL,
  cover_url     TEXT,
  summary       TEXT,
  rating        FLOAT4        CHECK (rating >= 0 AND rating <= 100),
  genres        TEXT[],
  platforms     TEXT[],
  release_date  DATE,
  developer     TEXT,
  publisher     TEXT,
  igdb_raw      JSONB,
  cached_at     TIMESTAMPTZ   DEFAULT NOW(),
  expires_at    TIMESTAMPTZ   NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- ============================================================
-- TABLE: youtube_cache
-- Source: YouTube Data v3
-- Cache TTL: 12 hours
-- ============================================================
CREATE TABLE IF NOT EXISTS youtube_cache (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id       UUID          NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  video_id      TEXT          NOT NULL,
  title         TEXT          NOT NULL,
  thumbnail_url TEXT,
  channel_name  TEXT,
  view_count    BIGINT        DEFAULT 0,
  published_at  TIMESTAMPTZ,
  cached_at     TIMESTAMPTZ   DEFAULT NOW(),
  expires_at    TIMESTAMPTZ   NOT NULL DEFAULT (NOW() + INTERVAL '12 hours'),
  UNIQUE (game_id, video_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_games_slug 
  ON games(slug);

CREATE INDEX IF NOT EXISTS idx_games_rating_desc 
  ON games(rating DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_games_expires 
  ON games(expires_at);

CREATE INDEX IF NOT EXISTS idx_yt_game 
  ON youtube_cache(game_id, expires_at);
