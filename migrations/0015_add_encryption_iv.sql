-- Add encryption_iv field to messages table
ALTER TABLE messages ADD COLUMN encryption_iv TEXT;

-- Create encryption_keys table
CREATE TABLE encryption_keys (
  key_id VARCHAR(255) PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES circles(circle_id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
  key_data TEXT NOT NULL,
  algorithm VARCHAR(20) NOT NULL DEFAULT 'AES-GCM',
  key_length INTEGER NOT NULL DEFAULT 256,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on encryption_keys for efficient lookups
CREATE INDEX idx_encryption_keys_channel ON encryption_keys(channel_id);
CREATE INDEX idx_encryption_keys_circle ON encryption_keys(circle_id);
CREATE INDEX idx_encryption_keys_active ON encryption_keys(is_active); 