-- Migration 007: Create Compliance Scores Table (Historical)
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL,
  total_requirements INTEGER NOT NULL DEFAULT 0,
  completed_requirements INTEGER NOT NULL DEFAULT 0,
  pending_requirements INTEGER NOT NULL DEFAULT 0,
  overdue_requirements INTEGER NOT NULL DEFAULT 0,
  breakdown JSONB,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_company ON compliance_scores(company_id, calculated_at DESC);
CREATE INDEX idx_scores_date ON compliance_scores(calculated_at DESC);
