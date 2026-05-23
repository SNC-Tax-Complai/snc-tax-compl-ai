-- Migration 014: Add data provenance tracking to compliance statuses
ALTER TABLE compliance_statuses
  ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'non_compliant',
  ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_statuses_data_source ON compliance_statuses(data_source);
