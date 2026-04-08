-- ============================================================
-- StreamPulse: Creators Domain Tables
-- Migration 003 - Creators + Twitch Clips Cache
-- ============================================================

-- ============================================================
-- TABLE: creators
-- Linked to Supabase Auth (auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS creators (
  id                      UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  twitch_broadcaster_id   TEXT          UNIQUE,
  display_name            TEXT          NOT NULL,
  avatar_url              TEXT,
  banner_url              TEXT,
  bio                     TEXT,
  socials                 JSONB,         -- { twitter, youtube, discord }
  follower_count          INTEGER       DEFAULT 0,
  is_featured             BOOLEAN       DEFAULT FALSE,
  created_at              TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- TABLE: twitch_clips_cache
-- Source: Twitch Helix /clips
-- Cache TTL: 1 hour
-- ============================================================
CREATE TABLE IF NOT EXISTS twitch_clips_cache (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID          REFERENCES creators(id) ON DELETE CASCADE,
  game_id         UUID          REFERENCES games(id) ON DELETE SET NULL,
  clip_id         TEXT          UNIQUE NOT NULL,
  title           TEXT          NOT NULL,
  thumbnail_url   TEXT,
  view_count      INTEGER       DEFAULT 0,
  duration        FLOAT4,
  created_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ   NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_creators_featured 
  ON creators(is_featured) 
  WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_clips_creator 
  ON twitch_clips_cache(creator_id, expires_at);
