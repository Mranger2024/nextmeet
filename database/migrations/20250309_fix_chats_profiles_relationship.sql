-- Drop existing foreign key constraint if exists
ALTER TABLE chats
    DROP CONSTRAINT IF EXISTS chats_created_by_fkey;

-- Update chats table to reference profiles instead of auth.users
ALTER TABLE chats
    ADD CONSTRAINT chats_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_chats_created_by
    ON chats(created_by);

-- Update chat_messages to reference profiles
ALTER TABLE chat_messages
    DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;

ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey
    FOREIGN KEY (sender_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
    ON chat_messages(sender_id);

-- Add chats definition to TypeScript types
COMMENT ON TABLE chats IS '@typescript-definition
type Chats = {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  avatar_url: string | null;
}';