-- Migration 003: Create Compliance Requirements Table
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  regulation_code VARCHAR(50),
  module VARCHAR(50) NOT NULL,
  compliance_type VARCHAR(50),
  frequency VARCHAR(50),
  applicable_company_types TEXT[],
  applicable_sectors TEXT[],
  min_employees INTEGER DEFAULT 0,
  penalty_description TEXT,
  penalty_amount DECIMAL(12, 2),
  reference_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requirements_module ON compliance_requirements(module);
CREATE INDEX idx_requirements_code ON compliance_requirements(regulation_code);
CREATE INDEX idx_requirements_active ON compliance_requirements(is_active);

CREATE OR REPLACE FUNCTION update_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requirements_updated_at_trigger
BEFORE UPDATE ON compliance_requirements
FOR EACH ROW
EXECUTE FUNCTION update_requirements_updated_at();
