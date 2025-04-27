-- Drop existing chat_participants policies
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can add participants to their chats" ON chat_participants;

-- Add avatar_url column to chats table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE chats ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create new non-recursive policies for chat_participants
CREATE POLICY "Users can view chat participants"
    ON chat_participants FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_participants cp
            WHERE cp.chat_id = chat_participants.chat_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add participants to their chats"
    ON chat_participants FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM chats
        WHERE id = chat_id
        AND created_by = auth.uid()
    ));

-- Create index for avatar_url if not exists
CREATE INDEX IF NOT EXISTS idx_chats_avatar_url ON chats(avatar_url);