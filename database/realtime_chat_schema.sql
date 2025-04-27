-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Socket Connections Table
CREATE TABLE IF NOT EXISTS socket_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    socket_id TEXT NOT NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(socket_id)
);

-- Real-time Presence Table
CREATE TABLE IF NOT EXISTS presence (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'away')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Typing Status Table
CREATE TABLE IF NOT EXISTS chat_typing_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    typing BOOLEAN DEFAULT false,
    last_typed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Message Delivery Status Table
CREATE TABLE IF NOT EXISTS message_delivery_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(message_id, recipient_id)
);

-- Create indexes for performance
CREATE INDEX idx_socket_connections_user ON socket_connections(user_id);
CREATE INDEX idx_socket_connections_socket ON socket_connections(socket_id);
CREATE INDEX idx_presence_status ON presence(status);
CREATE INDEX idx_typing_status_chat ON chat_typing_status(chat_id);
CREATE INDEX idx_message_delivery_message ON message_delivery_status(message_id);
CREATE INDEX idx_message_delivery_recipient ON message_delivery_status(recipient_id);

-- Enable Row Level Security
ALTER TABLE socket_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_delivery_status ENABLE ROW LEVEL SECURITY;

-- Socket Connections Policies
CREATE POLICY "Users can view their own socket connections"
    ON socket_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own socket connections"
    ON socket_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own socket connections"
    ON socket_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own socket connections"
    ON socket_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Presence Policies
CREATE POLICY "Everyone can view presence status"
    ON presence FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own presence"
    ON presence FOR UPDATE
    USING (auth.uid() = id);

-- Typing Status Policies
CREATE POLICY "Chat participants can view typing status"
    ON chat_typing_status FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_participants
            WHERE chat_participants.chat_id = chat_typing_status.chat_id
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own typing status"
    ON chat_typing_status FOR UPDATE
    USING (auth.uid() = user_id);

-- Message Delivery Status Policies
CREATE POLICY "Message senders and recipients can view delivery status"
    ON message_delivery_status FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_messages
            WHERE chat_messages.id = message_delivery_status.message_id
            AND (chat_messages.sender_id = auth.uid() OR message_delivery_status.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Recipients can update their message delivery status"
    ON message_delivery_status FOR UPDATE
    USING (auth.uid() = recipient_id);

-- Enable realtime subscriptions for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE socket_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_typing_status;
ALTER PUBLICATION supabase_realtime ADD TABLE message_delivery_status;