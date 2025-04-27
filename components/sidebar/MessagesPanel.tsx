'use client'

import ComingSoonPanel from './ComingSoonPanel'

interface Participant {
  id: string;
  username: string;
  avatar_url?: string | null;
}

interface Chat {
  id: string;
  name: string;
  participants: Participant[];
  is_group: boolean;
  created_at: string;
}

interface MessagesPanelProps {
  selectedChat: Chat | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}

export default function MessagesPanel({}: MessagesPanelProps) {
  // Using empty object pattern to indicate props are intentionally unused
  return <ComingSoonPanel feature="Messaging System" />
}

/* Original MessagesPanel implementation preserved for future use

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users, UserPlus, MessageSquare, Send, AtSign, Image as ImageIcon, ArrowLeft, File as FileIcon, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  chat_id: string
  sender: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
  }
  file_url?: string
  file_type?: string
  seen?: boolean
  delivered?: boolean
}

interface Chat {
  id: string
  name?: string
  is_group: boolean
  avatar_url?: string
  participants: {
    id: string
    username: string
    display_name?: string
    avatar_url?: string
    online?: boolean
  }[]
}

interface MessagesPanelProps {
  selectedChat: { id: string; name: string; participants: any[]; is_group: boolean; created_at: string } | null;
  setSelectedChat: (chat: { id: string; name: string; participants: any[]; is_group: boolean; created_at: string } | null) => void;
}

// Original implementation will be restored here
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chats when component mounts
  useEffect(() => {
    
    const fetchChats = async () => {
      if (!currentUser) return;
      
      try {
        // First, get the chat IDs that the current user is a part of
        const { data: participations, error: participationsError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', currentUser.id);
        
        if (participationsError) {
          console.error('Error fetching chat participations:', participationsError);
          toast.error(`Failed to load chats: ${participationsError.message}`);
          return;
        }
        
        // No participations found
        if (!participations || participations.length === 0) {
          setChats([]);
          return;
        }
        
        // Extract the chat IDs
        const chatIds = participations.map(p => p.chat_id);
        
        // Then fetch the chats with those IDs
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select(`
            id,
            name,
            is_group,
            avatar_url,
            last_message_at,
            participants:profiles(
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .in('id', chatIds)
          .order('last_message_at', { ascending: false });
          
        if (chatsError) {
          console.error('Error fetching chats:', chatsError);
          toast.error(`Failed to load chats: ${chatsError.message}`);
          return;
        }
        
        // Process the data to format it correctly
        const processedData = chatsData?.map(chat => {
          return {
            ...chat,
            participants: chat.participants || []
          };
        }) || [];
        
        setChats(processedData);
      } catch (err) {
        const error = err as Error;
        console.error('Unexpected error while fetching chats:', {
          message: error.message,
          stack: error.stack
        });
        toast.error('An unexpected error occurred while loading chats');
      }
    };

    fetchChats();
  }, [currentUser]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Filter messages when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(message => 
      message.content?.toLowerCase().includes(query) ||
      message.sender?.username?.toLowerCase().includes(query) ||
      message.sender?.display_name?.toLowerCase().includes(query)
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [messages, searchQuery])

  // Get current user and set up message seen tracking
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUser({ ...user, ...profile })
      }
    }
    getCurrentUser()
  }, [])

  // Mark messages as seen when they are viewed
  useEffect(() => {
    if (!currentUser || !initialChat || messages.length === 0) return;

    const unseenMessages = messages.filter(
      m => m.sender_id !== currentUser.id && !m.seen
    );

    if (unseenMessages.length > 0) {
      const updateMessageStatus = async () => {
        try {
          // First mark messages as delivered
          await supabase
            .from('chat_messages')
            .update({ delivered: true })
            .in('id', unseenMessages.map(m => m.id));

          // Then mark them as seen after a short delay
          setTimeout(async () => {
            await supabase
              .from('chat_messages')
              .update({ seen: true })
              .in('id', unseenMessages.map(m => m.id));

            // Update local state
            setMessages(prev => prev.map(m => 
              unseenMessages.some(um => um.id === m.id)
                ? { ...m, seen: true }
                : m
            ));
          }, 1000); // 1 second delay to show delivered status
        } catch (error) {
          console.error('Error marking messages as seen:', error);
        }
      };

      updateMessageStatus();
    }
  }, [currentUser, initialChat, messages])

  useEffect(() => {
    if (!currentUser) return
    
    const fetchMessages = async () => {
      if (!initialChat) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          chat_id,
          file_url,
          file_type,
          seen,
          delivered,
          sender:profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('chat_id', initialChat.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      setMessages(data || []);
      scrollToBottom();
    };

    // Subscribe to new messages and message updates
    const setupMessageSubscription = () => {
      if (!initialChat) return;

      const messageSubscription = supabase
        .channel(`chat:${initialChat.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_id=eq.${initialChat.id}`,
          },
          async (payload: any) => {
            if (payload.eventType === 'INSERT') {
              const { data: message } = await supabase
                .from('chat_messages')
                .select(`
                  id,
                  content,
                  created_at,
                  sender_id,
                  chat_id,
                  file_url,
                  file_type,
                  seen,
                  delivered,
                  sender:profiles (
                    id,
                    username,
                    display_name,
                    avatar_url
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (message) {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // Show notification for new messages from others
                if (message.sender_id !== currentUser?.id && 'Notification' in window && Notification.permission === 'granted') {
                  new Notification(`New message from ${message.sender.username}`, {
                    body: message.content,
                    icon: message.sender.avatar_url,
                  });
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
      };
    };

    fetchMessages();
    const unsubscribe = setupMessageSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };

    fetchChats()
  }, [currentUser])

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Filter messages when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(message => 
      message.content?.toLowerCase().includes(query) ||
      message.sender?.username?.toLowerCase().includes(query) ||
      message.sender?.display_name?.toLowerCase().includes(query)
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

  // Auto-scroll to bottom for new messages, but only if not searching
  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [messages, searchQuery]);

  const typingChannel = useMemo(() => {
    if (!currentUser || !initialChat) return null;
    return supabase.channel(`typing:${initialChat.id}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
        broadcast: { self: false },
      },
    });
  }, [currentUser, initialChat]);

  const handleTyping = useCallback(() => {
    if (!typingChannel || !currentUser) return;

    if (!typingTimeoutRef.current) {
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await typingChannel.track({
            isTyping: false,
            user_id: currentUser.id,
            username: currentUser.username,
            timestamp: Date.now(),
          });
          setIsTyping(false);
        } catch (error) {
          console.error('Error updating typing status:', error);
        }
        typingTimeoutRef.current = undefined;
      }, 2000);
    }

    if (!isTyping) {
      setIsTyping(true);
      try {
        typingChannel.track({
          isTyping: true,
          user_id: currentUser.id,
          username: currentUser.username,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error updating typing status:', error);
        setIsTyping(false);
      }
    }
  }, [typingChannel, currentUser, isTyping]);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.trim()) {
      handleTyping();
    } else if (isTyping && typingChannel) {
      setIsTyping(false);
      try {
        typingChannel.track({
          isTyping: false,
          user_id: currentUser?.id,
          username: currentUser?.username,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    }
  }, [handleTyping, isTyping, typingChannel, currentUser]);

  useEffect(() => {
    if (!typingChannel || !currentUser) return;

    let mounted = true;
    let subscribed = false;

    const setupTypingChannel = async () => {
      try {
        await typingChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && mounted) {
            subscribed = true;
            await typingChannel.track({
              isTyping: false,
              user_id: currentUser.id,
              username: currentUser.username,
              timestamp: Date.now(),
            });
          }
        });

        // Handle presence sync (initial state and updates)
        typingChannel.on('presence', { event: 'sync' }, () => {
          if (!mounted) return;

          const newTypingUsers = new Set<string>();
          const presenceState = typingChannel.presenceState();
          const now = Date.now();
          
          Object.values(presenceState).forEach((presence: any) => {
            presence.forEach((p: any) => {
              // Only show typing indicator if it's recent (within last 10 seconds)
              if (p.isTyping && p.user_id !== currentUser.id && now - p.timestamp < 10000) {
                newTypingUsers.add(p.username);
              }
            });
          });
          
          setTypingUsers(newTypingUsers);
        });

        // Handle new users joining
        typingChannel.on('presence', { event: 'join' }, ({ key, newPresence }) => {
          if (!mounted) return;
          const presence = newPresence[0];
          if (presence.isTyping && presence.user_id !== currentUser.id && Date.now() - presence.timestamp < 10000) {
            setTypingUsers((prev) => new Set([...prev, presence.username]));
          }
        });

        // Handle users leaving
        typingChannel.on('presence', { event: 'leave' }, ({ key, leftPresence }) => {
          if (!mounted) return;
          const presence = leftPresence[0];
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(presence.username);
            return newSet;
          });
        });
      } catch (error) {
        console.error('Error setting up typing channel:', error);
        toast.error('Failed to connect to typing status');
      }
    };

    setupTypingChannel();

    // Cleanup function
    return () => {
      mounted = false;
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = undefined;
      }

      // Only cleanup if we successfully subscribed
      if (subscribed) {
        const cleanup = async () => {
          try {
            await typingChannel.track({
              isTyping: false,
              user_id: currentUser.id,
              username: currentUser.username,
              timestamp: Date.now(),
            });
            await typingChannel.untrack();
            await typingChannel.unsubscribe();
          } catch (error) {
            console.error('Error cleaning up typing channel:', error);
          }
        };
        cleanup();
      }
    };
  }, [typingChannel, currentUser]);

  // Handle file selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  // Handle file upload to storage
  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${initialChat.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !initialChat || !currentUser) return;

    try {
      let fileUrl = '';
      let fileType = '';

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        fileType = selectedFile.type;
      }

      const { error } = await supabase.from('chat_messages').insert({
        content: newMessage.trim(),
        chat_id: initialChat.id,
        sender_id: currentUser.id,
        file_url: fileUrl,
        file_type: fileType,
      });

      if (error) throw error;

      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (!currentUser || !initialChat) return;

    const messageChannel = supabase.channel(`messages:${initialChat.id}`, {
      config: {
        broadcast: { self: true },
      },
    });

    messageChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${initialChat.id}`,
        },
        async (payload) => {
          const { data: message } = await supabase
            .from('chat_messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              chat_id,
              file_url,
              file_type,
              seen,
              delivered,
              sender:profiles (
                id,
                username,
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (message) {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();

            // Show notification for new messages from others
            if (
              message.sender_id !== currentUser?.id &&
              document.hidden &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`New message from ${message.sender.username}`, {
                body: message.content,
                icon: message.sender.avatar_url,
              });
            }

            // Mark message as delivered if from another user
            if (message.sender_id !== currentUser.id) {
              await supabase
                .from('chat_messages')
                .update({ delivered: true })
                .eq('id', message.id);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${initialChat.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    // Initial message fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          chat_id,
          file_url,
          file_type,
          seen,
          delivered,
          sender:profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('chat_id', initialChat.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      setMessages(data || []);
      scrollToBottom();

      // Mark all messages as delivered
      const unseenMessages = data?.filter(
        (m) => m.sender_id !== currentUser.id && !m.delivered
      );

      if (unseenMessages?.length) {
        await supabase
          .from('chat_messages')
          .update({ delivered: true })
          .in(
            'id',
            unseenMessages.map((m) => m.id)
          );
      }
    };

    fetchMessages();

    return () => {
      messageChannel.unsubscribe();
    };
  }, [currentUser, initialChat]);

  return (
    <div className="h-full flex flex-col bg-gray-900/95 backdrop-blur-xl">
      {/* Search and Actions *//*}
     { <div className="flex-none p-4 border-b border-gray-800/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-10 pl-10 pr-4 rounded-xl backdrop-blur-sm border transition-all duration-200 ${searchQuery ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/20' : 'bg-gray-800/50 border-gray-700/50'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          />
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchQuery ? 'text-blue-400' : 'text-gray-400'}`} size={18} />
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-400"
            >
              {filteredMessages.length} results
            </motion.div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            <UserPlus size={18} />
            <span>New Chat</span>
          </button>
          <button className="flex-1 h-10 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-xl text-white font-medium border border-gray-700/50 hover:bg-gray-700/80 transition-all">
            <Users size={18} />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Chat List *//*}
      <div className="flex-1 overflow-hidden">
        {!initialChat ? (
          <div className="h-full overflow-y-auto py-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-800/50 rounded-xl mx-2 group transition-all"
              >
                <div className="flex-none w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-white">
                      {(chat.name || chat.participants?.[0]?.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-medium text-white truncate">
                    {chat.name || chat.participants?.[0]?.username || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
                
                {chat.unread_count > 0 && (
                  <span className="flex-none w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-medium flex items-center justify-center">
                    {chat.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Chat Header *//*}
            <div className="flex-none p-4 border-b border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {initialChat.avatar_url ? (
                    <img src={initialChat.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-white">
                      {(initialChat.name || initialChat.participants?.[0]?.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div>
                  <h2 className="font-medium text-white">
                    {initialChat.name || initialChat.participants?.[0]?.username || 'Unknown'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {initialChat.is_group && initialChat.participants ? `${initialChat.participants.length} members` : 'Online'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages *//*}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${
                    message.sender_id === currentUser?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-none">
                    {message.sender.avatar_url ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={message.sender.avatar_url}
                          alt={message.sender.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex flex-col gap-1 ${
                      message.sender_id === currentUser?.id ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {message.sender.display_name || message.sender.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={`max-w-md rounded-xl p-3 ${
                        message.sender_id === currentUser?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800/80 text-gray-100'
                      }`}
                    >
                      {message.file_url && (
                        <div className="mb-2">
                          {message.file_type?.startsWith('image/') ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-700/50">
                              <Image
                                src={message.file_url}
                                alt="Attachment"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all"
                            >
                              <FileIcon size={20} className="text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">
                                  {message.content || "Attachment"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Click to download
                                </p>
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                      {message.content && !message.file_url && (
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {message.sender_id === currentUser?.id && (
                        <>
                          {message.seen ? (
                            <span>Seen</span>
                          ) : message.delivered ? (
                            <span>Delivered</span>
                          ) : (
                            <span>Sent</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator *//*}
            {typingUsers.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-none px-4 py-2 border-t border-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    {[...typingUsers].map((username, i) => (
                      <React.Fragment key={username}>
                        <span className="font-medium text-gray-300">
                          {username}
                        </span>
                        {i < typingUsers.size - 1 && typingUsers.size > 2 && ", "}
                        {i === typingUsers.size - 2 && typingUsers.size > 1 && " and "}
                      </React.Fragment>
                    ))}
                    <span>{typingUsers.size === 1 ? " is" : " are"} typing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message Input *//*}
            <div className="flex-none p-4 border-t border-gray-800/50 backdrop-blur-sm">
              {selectedFile && (
                <div className="mb-2 p-2 bg-gray-800/50 rounded-lg flex items-center gap-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      <FileIcon size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="p-1 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={handleMessageChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full h-10 bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white placeholder-gray-400 resize-none"
                    style={{ lineHeight: '24px' }}
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/80 transition-all"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <ImageIcon size={20} />
                  )}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                  className="h-10 w-10 flex items-center justify-center bg-blue-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}*/
