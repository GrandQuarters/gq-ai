-- ==========================================
-- GQ-AI Supabase Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CONTACTS TABLE
-- ==========================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('airbnb', 'expedia', 'booking', 'fewo', 'whatsapp', 'unknown')),
  email VARCHAR(255),
  phone_number VARCHAR(50),
  avatar TEXT NOT NULL,
  booking_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT contacts_email_or_phone CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

CREATE INDEX idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_phone ON contacts(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_contacts_platform ON contacts(platform);
CREATE INDEX idx_contacts_last_message ON contacts(last_message_at DESC);
CREATE INDEX idx_contacts_booking_url ON contacts(booking_url) WHERE booking_url IS NOT NULL;
CREATE INDEX idx_contacts_airbnb_booking_url ON contacts(booking_url) WHERE platform = 'airbnb' AND booking_url IS NOT NULL;

-- ==========================================
-- CONVERSATIONS TABLE
-- ==========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('airbnb', 'expedia', 'booking', 'fewo', 'whatsapp', 'unknown')),
  email_thread_id VARCHAR(255), -- Gmail thread ID (null for WhatsApp)
  platform_conversation_hash VARCHAR(255), -- Unique hash from platform or phone number
  last_message TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- PMS data (populated from my-bookings.cc API)
  booking_number VARCHAR(100),
  checkin_date VARCHAR(30),
  checkout_date VARCHAR(30),
  checkin_time VARCHAR(10),
  checkout_time VARCHAR(10),
  keybox_code VARCHAR(50),
  guest_phone VARCHAR(50),
  object_name_internal VARCHAR(255),
  adults INTEGER,
  children INTEGER,

  -- Indexes
  CONSTRAINT conversations_unique_thread UNIQUE (email_thread_id),
  CONSTRAINT conversations_unique_hash UNIQUE (platform_conversation_hash)
);

CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_action_required ON conversations(action_required) WHERE action_required = TRUE;

-- ==========================================
-- MESSAGES TABLE
-- ==========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_id VARCHAR(255) NOT NULL, -- Contact ID or 'admin'
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_own BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE if sent by admin, FALSE if received
  external_message_id VARCHAR(255), -- Gmail message ID or WhatsApp message ID
  
  -- Metadata
  read_at TIMESTAMPTZ, -- When admin read the message
  delivered_at TIMESTAMPTZ, -- When message was delivered (for sent messages)
  
  CONSTRAINT messages_unique_external UNIQUE (external_message_id)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at);
CREATE INDEX idx_messages_external ON messages(external_message_id) WHERE external_message_id IS NOT NULL;
CREATE INDEX idx_messages_is_own ON messages(conversation_id, is_own);

-- ==========================================
-- AI_RESPONSES TABLE (NEW!)
-- Track AI-generated responses, including pending and sent ones
-- ==========================================
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- The AI-generated response
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'superseded', 'discarded')),
  
  -- Tracking which messages this responds to
  source_message_ids UUID[] NOT NULL DEFAULT '{}', -- Array of message IDs this responds to
  unanswered_message_count INTEGER NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ, -- When admin actually sent it (null if still pending)
  superseded_at TIMESTAMPTZ, -- When this was replaced by a newer AI response
  
  -- Response metadata
  model VARCHAR(50), -- e.g., 'gpt-4'
  tokens_used INTEGER,
  generation_time_ms INTEGER
);

CREATE INDEX idx_ai_responses_conversation ON ai_responses(conversation_id, created_at DESC);
CREATE INDEX idx_ai_responses_status ON ai_responses(conversation_id, status) WHERE status = 'pending';
CREATE INDEX idx_ai_responses_source ON ai_responses USING GIN(source_message_ids);

-- ==========================================
-- PROCESSED_MESSAGES TABLE
-- Track which external messages have been processed (Gmail, WhatsApp)
-- ==========================================
CREATE TABLE processed_messages (
  external_message_id VARCHAR(255) PRIMARY KEY, -- Gmail or WhatsApp message ID
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('gmail', 'whatsapp')),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_processed_messages_platform ON processed_messages(platform);
CREATE INDEX idx_processed_messages_processed_at ON processed_messages(processed_at);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ai_responses
CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON ai_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Get unanswered messages (guest messages since last admin message)
CREATE OR REPLACE FUNCTION get_unanswered_messages(p_conversation_id UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_name VARCHAR,
  sent_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH last_admin_message AS (
    SELECT sent_at 
    FROM messages 
    WHERE conversation_id = p_conversation_id 
      AND is_own = TRUE 
    ORDER BY sent_at DESC 
    LIMIT 1
  )
  SELECT m.id, m.content, m.sender_name, m.sent_at
  FROM messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.is_own = FALSE
    AND (
      NOT EXISTS (SELECT 1 FROM last_admin_message)
      OR m.sent_at > (SELECT sent_at FROM last_admin_message)
    )
  ORDER BY m.sent_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get or supersede pending AI response
CREATE OR REPLACE FUNCTION get_or_supersede_pending_ai_response(p_conversation_id UUID)
RETURNS UUID AS $$
DECLARE
  v_pending_response_id UUID;
BEGIN
  -- Find pending AI response
  SELECT id INTO v_pending_response_id
  FROM ai_responses
  WHERE conversation_id = p_conversation_id
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If found, mark as superseded
  IF v_pending_response_id IS NOT NULL THEN
    UPDATE ai_responses
    SET status = 'superseded',
        superseded_at = NOW()
    WHERE id = v_pending_response_id;
  END IF;
  
  RETURN v_pending_response_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for all tables (optional, configure as needed)
-- ==========================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for service role, customize as needed)
CREATE POLICY "Allow all operations for service role" ON contacts
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for service role" ON conversations
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for service role" ON messages
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for service role" ON ai_responses
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all operations for service role" ON processed_messages
  FOR ALL TO authenticated USING (true);

-- ==========================================
-- SAMPLE QUERIES FOR REFERENCE
-- ==========================================

-- Get all conversations with contact details
-- SELECT 
--   c.*,
--   ct.name AS contact_name,
--   ct.avatar AS contact_avatar,
--   ct.platform AS contact_platform
-- FROM conversations c
-- JOIN contacts ct ON c.contact_id = ct.id
-- ORDER BY c.updated_at DESC;

-- Get all messages for a conversation with AI responses
-- SELECT 
--   m.*,
--   ar.content AS ai_response,
--   ar.status AS ai_status
-- FROM messages m
-- LEFT JOIN ai_responses ar ON m.id = ANY(ar.source_message_ids)
-- WHERE m.conversation_id = 'uuid-here'
-- ORDER BY m.sent_at ASC;

-- Get pending AI response for a conversation
-- SELECT *
-- FROM ai_responses
-- WHERE conversation_id = 'uuid-here'
--   AND status = 'pending'
-- ORDER BY created_at DESC
-- LIMIT 1;

-- Get unanswered messages
-- SELECT * FROM get_unanswered_messages('conversation-uuid-here');

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE contacts IS 'Stores guest/customer contact information from all platforms';
COMMENT ON TABLE conversations IS 'Tracks individual conversation threads with guests';
COMMENT ON TABLE messages IS 'Stores all messages (sent and received) in conversations';
COMMENT ON TABLE ai_responses IS 'Tracks AI-generated responses including pending, sent, and superseded ones';
COMMENT ON TABLE processed_messages IS 'Prevents duplicate processing of external messages (Gmail, WhatsApp)';

COMMENT ON COLUMN messages.is_own IS 'TRUE if message was sent by admin, FALSE if received from guest';
COMMENT ON COLUMN ai_responses.status IS 'pending: not yet sent, sent: admin sent it, superseded: replaced by newer AI response, discarded: admin wrote custom response';
COMMENT ON COLUMN ai_responses.source_message_ids IS 'Array of message UUIDs that this AI response addresses';

