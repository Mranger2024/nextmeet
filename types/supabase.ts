export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string | null
          gender: 'male' | 'female' | 'other' | null
          country: string | null
          created_at: string
          updated_at: string
          avatar_url?: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name?: string | null
          gender?: 'male' | 'female' | 'other' | null
          country?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          gender?: 'male' | 'female' | 'other' | null
          country?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string | null
          is_group: boolean
          created_by: string | null
          created_at: string
          updated_at: string
          last_message_at: string
          avatar_url: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          is_group?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          is_group?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string
          avatar_url?: string | null
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
          role: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
          role?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          joined_at?: string
          role?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string | null
          content: string | null
          file_url: string | null
          file_type: string | null
          created_at: string
          updated_at: string
          delivered: boolean
          seen: boolean
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id?: string | null
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          created_at?: string
          updated_at?: string
          delivered?: boolean
          seen?: boolean
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string | null
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          created_at?: string
          updated_at?: string
          delivered?: boolean
          seen?: boolean
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'friend_request' | 'room_invite' | 'message'
          content: string
          from_user_id: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'friend_request' | 'room_invite' | 'message'
          content: string
          from_user_id: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'friend_request' | 'room_invite' | 'message'
          content?: string
          from_user_id?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}