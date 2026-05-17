-- Migration 006: Create Notifications Table
-- Date: 2026-05-17

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_notification_type CHECK (type IN ('reminder','overdue','alert','info','system')),
  CONSTRAINT valid_severity CHECK (severity IN ('low','medium','high','critical'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
