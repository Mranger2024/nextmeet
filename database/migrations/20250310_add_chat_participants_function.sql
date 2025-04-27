-- Create a function to add chat participants in a single transaction
CREATE OR REPLACE FUNCTION add_chat_participants(p_chat_id UUID, p_user_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify that the user executing the function is either the chat creator or an admin
  IF NOT EXISTS (
    SELECT 1 FROM chats
    WHERE id = p_chat_id
    AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized to add participants to this chat';
  END IF;

  -- Insert all participants in a single transaction
  INSERT INTO chat_participants (chat_id, user_id)
  SELECT p_chat_id, unnest(p_user_ids);

EXCEPTION
  WHEN unique_violation THEN
    -- Ignore duplicate participants
    NULL;
END;
$$;