'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { AtSign, Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  username: string
  display_name?: string
}

interface ChatPanelProps {
  roomId: string
  roomName: string
  participants: Map<string, {
    id: string
    username: string
    displayName?: string
  }>
}

export default function ChatPanel({ roomId, participants }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  interface CurrentUser {
    id: string
    username?: string
    display_name?: string
    app_metadata: Record<string, unknown>
    user_metadata: Record<string, unknown>
    aud: string
    created_at: string
    updated_at?: string
    email?: string
    phone?: string
    role?: string
  }
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('Error getting user:', error?.message || 'No user found')
        return
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name')
        .eq('id', user.id)
        .single()
        
      setCurrentUser({
        ...user,
        username: profile?.username,
        display_name: profile?.display_name
      })
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}:chat`)
      .on('broadcast', { event: 'message' }, payload => {
        const message = payload.payload as Message
        setMessages(prev => [...prev, message])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    try {
      setIsSending(true)
      const message: Message = {
        id: crypto.randomUUID(),
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        username: currentUser.username || 'Unknown User',
        display_name: currentUser.display_name
      }

      await supabase.channel(`room:${roomId}:chat`).send({
        type: 'broadcast',
        event: 'message',
        payload: message
      })

      setNewMessage('')
    } catch (error: unknown) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  if (!currentUser) return null

  const participantArray = Array.from(participants.values())

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="p-2 md:p-4 space-y-2 md:space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.user_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded p-2 ${
                  message.user_id === currentUser.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {message.user_id !== currentUser.id && (
                  <div className="text-sm font-medium text-gray-300 mb-1">
                    {message.display_name || message.username}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-none border-t border-gray-800">
        <div className="relative flex items-center p-2 gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-gray-800/50 text-white rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
              disabled={isSending}
            />
            <button
              onClick={() => setShowMentionDropdown(!showMentionDropdown)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors rounded"
            >
              <AtSign size={16} />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
            className="flex-none p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="-rotate-45" />
          </button>
        </div>

        {showMentionDropdown && participantArray.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
            {participantArray.map(participant => (
              <button
                key={participant.id}
                onClick={() => {
                  const mention = `@${participant.username} `
                  setNewMessage(prev => prev + mention)
                  setShowMentionDropdown(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {(participant.displayName || participant.username)[0].toUpperCase()}
                  </span>
                </div>
                <span>{participant.displayName || participant.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}