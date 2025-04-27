import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { supabase } from './lib/supabase';

export function initializeChatServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000
  });

  // Store active users and their socket IDs
  const activeUsers = new Map<string, string>();

  // Function to emit active users count to all clients
  const emitActiveUsersCount = () => {
    io.emit('activeUsers', activeUsers.size);
    console.log(`Active users count: ${activeUsers.size}`);
  };

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
    
    // Add socket to active users map immediately on connection
    // This ensures we count all connected users, even if they don't authenticate
    activeUsers.set(socket.id, socket.id);
    
    // Emit active users count on new connection
    emitActiveUsersCount();

    // Handle user authentication
    socket.on('authenticate', async ({ userId }) => {
      try {
        // Store user's socket connection
        await supabase
          .from('socket_connections')
          .insert({
            user_id: userId,
            socket_id: socket.id
          });

        // Update user's presence
        await supabase
          .from('presence')
          .upsert({
            id: userId,
            status: 'online',
            last_seen: new Date().toISOString()
          });

        activeUsers.set(userId, socket.id);
        socket.join(`user:${userId}`);
        
        // Emit updated active users count
        emitActiveUsersCount();
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle joining chat rooms
    socket.on('join_chat', async ({ chatId, userId }) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Handle new messages
    socket.on('send_message', async (message) => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: message.chatId,
            sender_id: message.senderId,
            content: message.content,
            file_url: message.fileUrl,
            file_type: message.fileType
          })
          .select('*, sender:profiles(*)')
          .single();

        if (error) throw error;

        // Broadcast message to all participants in the chat
        io.to(`chat:${message.chatId}`).emit('message_received', data);

        // Update message delivery status
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', message.chatId);

        if (participants) {
          const deliveryStatuses = participants.map((p) => ({
            message_id: data.id,
            recipient_id: p.user_id,
            delivered_at: p.user_id === message.senderId ? new Date().toISOString() : null
          }));

          await supabase
            .from('message_delivery_status')
            .insert(deliveryStatuses);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing_start', async ({ chatId, userId, username }) => {
      try {
        await supabase
          .from('chat_typing_status')
          .upsert({
            chat_id: chatId,
            user_id: userId,
            typing: true,
            last_typed: new Date().toISOString()
          });

        socket.to(`chat:${chatId}`).emit('user_typing', { userId, username });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    });

    socket.on('typing_end', async ({ chatId, userId }) => {
      try {
        await supabase
          .from('chat_typing_status')
          .upsert({
            chat_id: chatId,
            user_id: userId,
            typing: false
          });

        socket.to(`chat:${chatId}`).emit('user_stopped_typing', { userId });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    });

    // Handle message seen status
    socket.on('mark_seen', async ({ messageId, userId }) => {
      try {
        const { error } = await supabase
          .from('message_delivery_status')
          .update({ read_at: new Date().toISOString() })
          .match({ message_id: messageId, recipient_id: userId });

        if (error) throw error;

        const { data: message } = await supabase
          .from('chat_messages')
          .select('chat_id, sender_id')
          .eq('id', messageId)
          .single();

        if (message) {
          io.to(`user:${message.sender_id}`).emit('message_seen', {
            messageId,
            userId
          });
        }
      } catch (error) {
        console.error('Error marking message as seen:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userId = Array.from(activeUsers.entries())
          .find(([_, socketId]) => socketId === socket.id)?.[0];

        if (userId) {
          // If this is an authenticated user (userId !== socket.id)
          if (userId !== socket.id) {
            // Update presence and socket connection
            await Promise.all([
              supabase
                .from('presence')
                .update({
                  status: 'offline',
                  last_seen: new Date().toISOString()
                })
                .eq('id', userId),
              supabase
                .from('socket_connections')
                .delete()
                .eq('socket_id', socket.id)
            ]);
          }

          activeUsers.delete(userId);
          
          // Emit updated active users count
          emitActiveUsersCount();
        }

        console.log('User disconnected:', socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
}