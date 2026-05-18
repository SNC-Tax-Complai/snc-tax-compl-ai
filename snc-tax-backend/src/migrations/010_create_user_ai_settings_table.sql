-- Migration: Create User AI Settings Table
-- Description: Per-user AI provider preferences, API keys, and model selections
-- Date: 2026-05-18

CREATE TABLE IF NOT EXISTS user_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openrouter',
  model VARCHAR(200),
  api_key_encrypted TEXT,
  endpoint_url VARCHAR(500),
  temperature NUMERIC(3,2) DEFAULT 0.5,
  max_tokens INTEGER DEFAULT 1500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_provider UNIQUE(user_id, provider)
);

CREATE INDEX idx_user_ai_settings_user ON user_ai_settings(user_id);
CREATE INDEX idx_user_ai_settings_active ON user_ai_settings(user_id, is_active);

-- User's preferred/default provider selection
CREATE TABLE IF NOT EXISTS user_ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_provider VARCHAR(50) DEFAULT 'openrouter',
  default_model VARCHAR(200) DEFAULT 'deepseek/deepseek-v4-flash:free',
  chat_enabled BOOLEAN DEFAULT true,
  auto_insights BOOLEAN DEFAULT true,
  auto_risk_analysis BOOLEAN DEFAULT true,
  auto_document_analysis BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_ai_prefs_user ON user_ai_preferences(user_id);

CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_settings_updated_at_trigger
BEFORE UPDATE ON user_ai_settings
FOR EACH ROW
EXECUTE FUNCTION update_ai_settings_updated_at();

CREATE TRIGGER ai_prefs_updated_at_trigger
BEFORE UPDATE ON user_ai_preferences
FOR EACH ROW
EXECUTE FUNCTION update_ai_settings_updated_at();
