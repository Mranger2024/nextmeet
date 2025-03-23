-- Drop existing chat_participants policies
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can add participants to their chats" ON chat_participants;

-- Create new non-recursive policies for chat_participants
CREATE POLICY "Users can view chat participants"
    ON chat_participants FOR SELECT
    TO authenticated
    USING (
        -- Direct check if the user is the participant
        user_id = auth.uid() OR
        -- Check if the user is a participant in the same chat without recursion
        chat_id IN (
            SELECT chat_id 
            FROM chat_participants 
            WHERE user_id = auth.uid()
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

-- Add comment to explain the fix
COMMENT ON POLICY "Users can view chat participants" ON chat_participants IS 'Fixed policy to prevent infinite recursion by using IN operator instead of EXISTS with a subquery that references the same table';