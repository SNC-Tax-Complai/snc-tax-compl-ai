-- Migration: Add notification preferences + phone/WhatsApp number to users
-- Date: 2026-05-23

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled        BOOLEAN DEFAULT true,
  whatsapp_enabled     BOOLEAN DEFAULT false,
  in_app_enabled       BOOLEAN DEFAULT true,
  deadline_3d          BOOLEAN DEFAULT true,
  deadline_7d          BOOLEAN DEFAULT true,
  deadline_overdue     BOOLEAN DEFAULT true,
  score_change         BOOLEAN DEFAULT true,
  score_weekly         BOOLEAN DEFAULT false,
  penalty_risk         BOOLEAN DEFAULT true,
  regulation_update    BOOLEAN DEFAULT true,
  filing_confirm       BOOLEAN DEFAULT true,
  audit_summary        BOOLEAN DEFAULT false,
  quiet_hours_from     VARCHAR(5) DEFAULT '20:00',
  quiet_hours_to       VARCHAR(5) DEFAULT '07:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);

CREATE OR REPLACE FUNCTION update_notif_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'notif_prefs_updated_at_trigger'
  ) THEN
    CREATE TRIGGER notif_prefs_updated_at_trigger
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_notif_prefs_updated_at();
  END IF;
END;
$$;
