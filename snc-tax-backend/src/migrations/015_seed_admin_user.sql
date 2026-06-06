-- Migration 015: Seed admin user and SNC-Tax company
-- Auto-generated for production bootstrap — DO NOT edit manually

-- Insert SNC-Tax company
INSERT INTO companies (
  id, name, company_type, industry_sector, contact_email, is_active
) VALUES (
  gen_random_uuid(),
  'SNC-Tax',
  'Private Company',
  'Tax & Compliance Services',
  'yolisa@snctax.co.za',
  true
) ON CONFLICT DO NOTHING;

-- Insert SA-iLabs admin user (system owner)
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  company_name,
  role,
  is_active
) VALUES (
  'chrsto@sa-ilabs.co.za',
  '$2b$12$XkFRTshvNJCZPJ7V/SHj.u7VYDQr/qu9abiiXTi8HoTyyzA7zuvAm',
  'Christo',
  'Botha',
  'SA-iLabs Holdings',
  'admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'admin',
  is_active = true;
