-- ============================================================
-- StreamPulse: News Domain Tables
-- Migration 004 - News Articles
-- ============================================================

-- ============================================================
-- TABLE: news_articles
-- Source: NewsData.io
-- Ingested every 6 hours via cron
-- ============================================================
CREATE TABLE IF NOT EXISTS news_articles (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT          UNIQUE NOT NULL,
  title           TEXT          NOT NULL,
  description     TEXT,
  content         TEXT,
  image_url       TEXT,
  source_name     TEXT          NOT NULL,
  source_url      TEXT          NOT NULL,
  relevance_score SMALLINT      DEFAULT 0 CHECK (relevance_score >= 0),
  keywords        TEXT[],
  published_at    TIMESTAMPTZ   NOT NULL,
  ingested_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_news_score_date 
  ON news_articles(relevance_score DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_published 
  ON news_articles(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_external 
  ON news_articles(external_id);
