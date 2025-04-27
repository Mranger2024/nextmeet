'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender?: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface ChatParticipant {
  user_id: string
  user: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export default function ChatPage() {
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [participants, setParticipants] = useState<ChatParticipant[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('chat_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data || [])
    scrollToBottom()
  }, [params.id, scrollToBottom])

  const fetchParticipants = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        user_id,
        user:profiles!chat_participants_user_id_fkey(
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('chat_id', params.id)

    if (error) {
      console.error('Error fetching participants:', error)
      return
    }

    const transformedParticipants = (data || []).map(participant => ({
      user_id: participant.user_id,
      user: {
        username: participant.user[0].username,
        display_name: participant.user[0].display_name,
        avatar_url: participant.user[0].avatar_url
      }
    }))

    setParticipants(transformedParticipants)
  }, [params.id])

  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel(`chat:${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${params.id}`
      }, payload => {
        const newMessage = payload.new as Message
        setMessages(prev => [...prev, newMessage])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id, scrollToBottom])

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchMessages()
        fetchParticipants()
        subscribeToMessages()
      }
    }
    getCurrentUser()
  }, [fetchMessages, fetchParticipants, subscribeToMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: params.id,
          sender_id: currentUserId,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const otherParticipant = participants.find(p => p.user_id !== currentUserId)?.user

  return (
    <div className="h-full flex flex-col bg-gray-900/95 backdrop-blur-md">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        {otherParticipant && (
          <>
            <Image
              src={otherParticipant.avatar_url || '/default-avatar.png'}
              alt={otherParticipant.display_name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{otherParticipant.display_name}</h2>
              <p className="text-sm text-gray-400">@{otherParticipant.username}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender_id === currentUserId ? 'flex-row-reverse' : ''
            }`}
          >
            <Image
              src={message.sender?.avatar_url || '/default-avatar.png'}
              alt={message.sender?.display_name || ''}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-blue-500/20 text-blue-500'
                  : 'bg-gray-800/50 text-white'
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}