-- ============================================================
-- StreamPulse: Fortnite Domain Tables
-- Migration 002 - Shop + Map History
-- ============================================================

-- ============================================================
-- TABLE: fortnite_shop
-- Source: FortniteAPI.io /v2/shop
-- Refreshed: Daily at 00:05 UTC via cron
-- ============================================================
CREATE TABLE IF NOT EXISTS fortnite_shop (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       TEXT          UNIQUE NOT NULL,
  name          TEXT          NOT NULL,
  type          TEXT          NOT NULL,
  rarity        TEXT,
  price_vbucks  INTEGER       CHECK (price_vbucks >= 0),
  image_url     TEXT,
  shop_date     DATE          NOT NULL DEFAULT CURRENT_DATE,
  raw_data      JSONB
);

-- ============================================================
-- TABLE: fortnite_map_history
-- Source: FortniteAPI.io /v1/map
-- Captured on demand, ISR 1 hour
-- ============================================================
CREATE TABLE IF NOT EXISTS fortnite_map_history (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  season              TEXT          NOT NULL,
  image_storage_path  TEXT          NOT NULL,
  pois                JSONB,
  captured_at         TIMESTAMPTZ   DEFAULT NOW(),
  is_current          BOOLEAN       DEFAULT FALSE
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fortnite_shop_date 
  ON fortnite_shop(shop_date DESC);

CREATE INDEX IF NOT EXISTS idx_fortnite_map_current 
  ON fortnite_map_history(is_current) 
  WHERE is_current = TRUE;
