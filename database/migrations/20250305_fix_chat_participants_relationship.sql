-- Drop existing foreign key constraint
ALTER TABLE chat_participants
    DROP CONSTRAINT IF EXISTS chat_participants_user_id_fkey;

-- Add new foreign key constraint referencing profiles table
ALTER TABLE chat_participants
    ADD CONSTRAINT chat_participants_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_chat_participants_profiles
    ON chat_participants(user_id);