-- Add authentication and security tables

-- Verification Tokens table (for email verification, password reset, 2FA setup)
CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('email_verification', 'password_reset', '2fa_setup') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on token for fast lookup
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_type ON verification_tokens(type);

-- Two Factor Authentication table
CREATE TABLE IF NOT EXISTS two_factor_auths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  method ENUM('email', 'sms', 'authenticator') NOT NULL,
  secret_key VARCHAR(255),
  is_enabled BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  backup_codes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_two_factor_auths_user_id ON two_factor_auths(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auths_is_enabled ON two_factor_auths(is_enabled);

-- Add is_active column to users if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_two_factor_auths_updated_at ON two_factor_auths;
CREATE TRIGGER update_two_factor_auths_updated_at
BEFORE UPDATE ON two_factor_auths
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
