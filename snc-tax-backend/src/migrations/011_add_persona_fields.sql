-- Migration: Add persona/system-prompt customization to user AI preferences
-- Date: 2026-05-23

ALTER TABLE user_ai_preferences
  ADD COLUMN IF NOT EXISTS persona_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS persona_description TEXT,
  ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- Custom model name field on per-provider settings (used by the 'custom' provider)
ALTER TABLE user_ai_settings
  ADD COLUMN IF NOT EXISTS custom_model_name VARCHAR(200);
