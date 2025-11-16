-- Migration: Add is_admin column to users table
-- Phase 7: Admin Panel Implementation
-- Date: 2025-11-16

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create an index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Optional: Create first admin user (update the email to match your admin user)
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'is_admin';
