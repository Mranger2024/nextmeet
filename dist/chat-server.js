"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeChatServer = initializeChatServer;
const socket_io_1 = require("socket.io");
const supabase_1 = require("./lib/supabase");
function initializeChatServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000
    });
    // Store active users and their socket IDs
    const activeUsers = new Map();
    // Function to emit active users count to all clients
    const emitActiveUsersCount = () => {
        io.emit('activeUsers', activeUsers.size);
        console.log(`Active users count: ${activeUsers.size}`);
    };
    io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
        console.log('User connected:', socket.id);
        // Add socket to active users map immediately on connection
        // This ensures we count all connected users, even if they don't authenticate
        activeUsers.set(socket.id, socket.id);
        // Emit active users count on new connection
        emitActiveUsersCount();
        // Handle user authentication
        socket.on('authenticate', (_a) => __awaiter(this, [_a], void 0, function* ({ userId }) {
            try {
                // Store user's socket connection
                yield supabase_1.supabase
                    .from('socket_connections')
                    .insert({
                    user_id: userId,
                    socket_id: socket.id
                });
                // Update user's presence
                yield supabase_1.supabase
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
            }
            catch (error) {
                console.error('Authentication error:', error);
            }
        }));
        // Handle joining chat rooms
        socket.on('join_chat', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, userId }) {
            socket.join(`chat:${chatId}`);
            console.log(`User ${userId} joined chat ${chatId}`);
        }));
        // Handle new messages
        socket.on('send_message', (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase_1.supabase
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
                if (error)
                    throw error;
                // Broadcast message to all participants in the chat
                io.to(`chat:${message.chatId}`).emit('message_received', data);
                // Update message delivery status
                const { data: participants } = yield supabase_1.supabase
                    .from('chat_participants')
                    .select('user_id')
                    .eq('chat_id', message.chatId);
                if (participants) {
                    const deliveryStatuses = participants.map((p) => ({
                        message_id: data.id,
                        recipient_id: p.user_id,
                        delivered_at: p.user_id === message.senderId ? new Date().toISOString() : null
                    }));
                    yield supabase_1.supabase
                        .from('message_delivery_status')
                        .insert(deliveryStatuses);
                }
            }
            catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        }));
        // Handle typing status
        socket.on('typing_start', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, userId, username }) {
            try {
                yield supabase_1.supabase
                    .from('chat_typing_status')
                    .upsert({
                    chat_id: chatId,
                    user_id: userId,
                    typing: true,
                    last_typed: new Date().toISOString()
                });
                socket.to(`chat:${chatId}`).emit('user_typing', { userId, username });
            }
            catch (error) {
                console.error('Error updating typing status:', error);
            }
        }));
        socket.on('typing_end', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, userId }) {
            try {
                yield supabase_1.supabase
                    .from('chat_typing_status')
                    .upsert({
                    chat_id: chatId,
                    user_id: userId,
                    typing: false
                });
                socket.to(`chat:${chatId}`).emit('user_stopped_typing', { userId });
            }
            catch (error) {
                console.error('Error updating typing status:', error);
            }
        }));
        // Handle message seen status
        socket.on('mark_seen', (_a) => __awaiter(this, [_a], void 0, function* ({ messageId, userId }) {
            try {
                const { error } = yield supabase_1.supabase
                    .from('message_delivery_status')
                    .update({ read_at: new Date().toISOString() })
                    .match({ message_id: messageId, recipient_id: userId });
                if (error)
                    throw error;
                const { data: message } = yield supabase_1.supabase
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
            }
            catch (error) {
                console.error('Error marking message as seen:', error);
            }
        }));
        // Handle disconnection
        socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = Array.from(activeUsers.entries())
                    .find(([_, socketId]) => socketId === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
                if (userId) {
                    // If this is an authenticated user (userId !== socket.id)
                    if (userId !== socket.id) {
                        // Update presence and socket connection
                        yield Promise.all([
                            supabase_1.supabase
                                .from('presence')
                                .update({
                                status: 'offline',
                                last_seen: new Date().toISOString()
                            })
                                .eq('id', userId),
                            supabase_1.supabase
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
            }
            catch (error) {
                console.error('Error handling disconnect:', error);
            }
        }));
    }));
    return io;
}
