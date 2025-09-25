-- Create conversations table for managing user conversation sessions
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    context_data JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_conversations_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT conversations_status_check CHECK (status IN ('active', 'paused', 'completed', 'cancelled'))
);

-- Create messages table for individual messages within conversations
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_messages_conversation_id FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT messages_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_context_data ON conversations USING GIN(context_data);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_message_type ON messages(message_type);

-- Create trigger to automatically update conversations.updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update conversation updated_at when messages are added
CREATE OR REPLACE FUNCTION update_conversation_on_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update conversation when new message is added
CREATE TRIGGER update_conversation_on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message_insert();

-- Add comments for documentation
COMMENT ON TABLE conversations IS 'User conversation sessions with the AI assistant';
COMMENT ON COLUMN conversations.context_data IS 'Conversation context and state information';
COMMENT ON COLUMN conversations.metadata IS 'Additional conversation metadata';

COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN messages.role IS 'Message sender role: user, assistant, or system';
COMMENT ON COLUMN messages.content IS 'Message content text';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text, image, file, etc.';
COMMENT ON COLUMN messages.metadata IS 'Additional message metadata and attachments';
