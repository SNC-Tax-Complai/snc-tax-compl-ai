-- Migration: Create Users Table
-- Description: Initial schema for user authentication and management
-- Date: 2026-05-17

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_id UUID,
  company_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Indexes for performance
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create index on email for faster lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Create index on created_at for sorting
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create index on company_id for filtering
CREATE INDEX idx_users_company_id ON users(company_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Insert sample user for testing (password: TestPass123)
-- In production, remove this or use a proper seed script
-- Password hash: bcryptjs.hash('TestPass123', 10)
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  company_name,
  role,
  is_active
) VALUES (
  'test@example.com',
  '$2a$10$...',  -- Replace with actual bcryptjs hash
  'Test',
  'User',
  'Test Company',
  'manager',
  true
) ON CONFLICT (email) DO NOTHING;
