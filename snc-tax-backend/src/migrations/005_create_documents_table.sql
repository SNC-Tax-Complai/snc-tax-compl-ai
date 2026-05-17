-- Migration 005: Create Documents Table
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status_id UUID REFERENCES compliance_statuses(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  category VARCHAR(50),
  uploaded_by UUID REFERENCES users(id),
  description TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_status ON documents(status_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_not_deleted ON documents(company_id) WHERE is_deleted = false;
