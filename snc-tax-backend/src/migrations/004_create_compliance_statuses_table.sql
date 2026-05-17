-- Migration 004: Create Compliance Statuses Table
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS compliance_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  due_date DATE,
  completion_date DATE,
  next_due_date DATE,
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('completed','pending','overdue','at_risk','not_applicable','in_progress'))
);

CREATE INDEX idx_statuses_company ON compliance_statuses(company_id);
CREATE INDEX idx_statuses_requirement ON compliance_statuses(requirement_id);
CREATE INDEX idx_statuses_status ON compliance_statuses(status);
CREATE INDEX idx_statuses_due_date ON compliance_statuses(due_date);
CREATE UNIQUE INDEX idx_statuses_unique ON compliance_statuses(company_id, requirement_id, due_date);

CREATE OR REPLACE FUNCTION update_statuses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER statuses_updated_at_trigger
BEFORE UPDATE ON compliance_statuses
FOR EACH ROW
EXECUTE FUNCTION update_statuses_updated_at();
