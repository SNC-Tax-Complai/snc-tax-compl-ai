-- Migration 002: Create Companies Table
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50),
  tax_reference VARCHAR(50),
  company_type VARCHAR(50),
  industry_sector VARCHAR(100),
  employee_count INTEGER DEFAULT 0,
  annual_turnover DECIMAL(15, 2),
  physical_address TEXT,
  postal_address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id foreign key to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_registration ON companies(registration_number);
CREATE INDEX idx_companies_tax_ref ON companies(tax_reference);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_updated_at();
