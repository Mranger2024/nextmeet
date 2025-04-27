'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Notification {
  id: string
  type: 'friend_request' | 'friend_accepted' | 'message' | 'room_invite' | 'room_expired'
  from_user_id: string
  content: string
  read: boolean
  created_at: string
  metadata?: {
    room_id: string
    group_id: string
  }
  from_user?: {
    username: string
    display_name: string
    avatar_url: string
  }
  room?: {
    created_at: string
    status: string
    last_active?: string
  }
}

interface NotificationsProps {
  onClose: () => void;
  onCountUpdate?: (count: number) => void;
}

export default function Notifications({ onClose, onCountUpdate }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  
  // Check if a room has expired
  const isRoomExpired = useCallback((roomId: string, createdAt: string, lastActive?: string) => {
    const now = new Date()
    const createdAtDate = new Date(createdAt)
    const lastActiveDate = lastActive ? new Date(lastActive) : createdAtDate
    const minutesSinceCreation = (now.getTime() - createdAtDate.getTime()) / 60000
    const minutesSinceLastActive = (now.getTime() - lastActiveDate.getTime()) / 60000

    return (
      minutesSinceCreation >= 10 || // Room is older than 10 minutes
      minutesSinceLastActive >= 5 // Inactive room for 5 minutes
    )
  }, [])

  const fetchNotifications = useCallback(async (uid: string) => {
    try {
      // Fetch notifications with proper user join
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:profiles!from_user_id(
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (notifError) {
        console.error('Error fetching notifications:', notifError.message);
        return;
      }

      if (notifications) {
        // For room_invite notifications, fetch room data to check if expired
        const roomInvites = notifications.filter(n => n.type === 'room_invite' && n.metadata?.room_id)
        
        if (roomInvites.length > 0) {
          const roomIds = roomInvites.map(n => n.metadata?.room_id).filter(Boolean)
          
          const { data: rooms } = await supabase
            .from('rooms')
            .select('id, created_at, status, last_active')
            .in('id', roomIds)
          
          // Attach room data to notifications
          if (rooms) {
            notifications.forEach(notification => {
              if (notification.type === 'room_invite' && notification.metadata?.room_id) {
                const room = rooms.find(r => r.id === notification.metadata?.room_id)
                if (room) {
                  notification.room = {
                    created_at: room.created_at,
                    status: room.status,
                    last_active: room.last_active
                  }
                }
              }
            })
          }
        }
        
        setNotifications(notifications);
        // Update unread count in sidebar
        const unreadCount = notifications.filter(n => !n.read).length;
        if (onCountUpdate) {
          // Use setTimeout to ensure this runs after render is complete
          setTimeout(() => {
            onCountUpdate(unreadCount);
          }, 0);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching notifications:', errorMessage);
    }
  }, [onCountUpdate])

  const subscribeToNotifications = useCallback((uid: string) => {
    try {
      const channel = supabase
        .channel(`notifications:${uid}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`
        }, payload => {
          setNotifications(prev => {
            const updatedNotifications = [payload.new as Notification, ...prev];
            // Update unread count in sidebar
            const unreadCount = updatedNotifications.filter(n => !n.read).length;
            if (onCountUpdate) {
              // Use setTimeout to ensure this runs after render is complete
              setTimeout(() => {
                onCountUpdate(unreadCount);
              }, 0);
            }
            return updatedNotifications;
          })
          toast.success('New notification received')
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to notifications')
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error subscribing to notifications:', errorMessage)
      return () => {}
    }
  }, [onCountUpdate])

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchNotifications(user.id)
        subscribeToNotifications(user.id)
      }
    }
    getCurrentUser()
  }, [fetchNotifications, subscribeToNotifications])

  const handleFriendRequest = async (notificationId: string, fromUserId: string, accept: boolean) => {
    try {
      if (!userId) return
 
      if (accept) {
        // Update friend request status
        const { error: friendError } = await supabase
          .from('friends')
          .update({ status: 'accepted' })
          .eq('user_id', fromUserId)
          .eq('friend_id', userId)
 
        if (friendError) throw friendError
 
        // Create notification for requester
        const { error: notifError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: fromUserId,
              type: 'friend_accepted',
              from_user_id: userId,
              content: 'accepted your friend request'
            }
          ])
 
        if (notifError) throw notifError
      }
 
      // Mark notification as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
 
      if (updateError) throw updateError

      // Update local state to reflect the change immediately
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        
        // Update unread count in sidebar
        const unreadCount = updated.filter(n => !n.read).length;
        if (onCountUpdate) {
          onCountUpdate(unreadCount);
        }
        
        return updated;
      });
 
      fetchNotifications(userId)
      toast.success(accept ? 'Friend request accepted' : 'Friend request declined')
    } catch (error) {
      console.error('Error handling friend request:', error)
      toast.error('Failed to process friend request')
    }
  }

  // Mark notification as read and handle navigation based on notification type
  const markNotificationAsRead = async (notification: Notification) => {
    try {
      // Skip if notification is already read
      if (notification.read) return
      
      // Mark notification as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)

      if (updateError) throw updateError

      // Update local state to reflect the change immediately
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        
        // Update unread count in sidebar
        const unreadCount = updated.filter(n => !n.read).length;
        if (onCountUpdate) {
          onCountUpdate(unreadCount);
        }
        
        return updated;
      });

      // Handle navigation based on notification type
      if (notification.type === 'room_invite' && notification.metadata?.room_id) {
        router.push(`/room/${notification.metadata.room_id}`)
      } else if (notification.type === 'message') {
        // Navigate to chat with the sender
        const { data, error } = await supabase
          .from('chats')
          .select('id')
          .eq('is_group', false)
          .filter('participants', 'cs', `{"${userId}","${notification.from_user_id}"}`)
          .single()

        if (!error && data) {
          router.push(`/chat/${data.id}`)
        }
      }
      
      // Refresh notifications
      if (userId) {
        fetchNotifications(userId);
      }
    } catch (error) {
      console.error('Error handling notification:', error)
      toast.error('Failed to process notification')
    }
  }

  const handleRoomInvite = async (notification: Notification, action: 'join' | 'busy') => {
    if (!notification.metadata?.room_id || !userId) {
      toast.error('Invalid room invitation')
      return
    }
 
    try {
      // First check if the room still exists and user has access
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', notification.metadata.room_id)
        .single()
 
      if (roomError || !room) {
        toast.error('Room no longer exists')
        return
      }
      
      // Check if room has expired
      if (room.status === 'ended' || isRoomExpired(room.id, room.created_at, room.last_active)) {
        toast.error('This room has expired')
        
        // Mark notification as read
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)
          
        // Refresh notifications
        await fetchNotifications(userId)
        return
      }
 
      // Update participant status
      const { error: updateError } = await supabase
        .from('room_participants')
        .update({ status: action === 'join' ? 'joined' : 'busy' })
        .eq('room_id', notification.metadata.room_id)
        .eq('user_id', userId)
 
      if (updateError) {
        throw new Error('Failed to update participant status')
      }
 
      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id)

      // Update local state to reflect the change immediately
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        );
        
        // Update unread count in sidebar
        const unreadCount = updated.filter(n => !n.read).length;
        if (onCountUpdate) {
          onCountUpdate(unreadCount);
        }
        
        return updated;
      });
 
      if (action === 'join') {
        // Redirect to video chat
        router.push(room.video_chat_url)
        toast.success('Joined room successfully')
      } else {
        toast.success('Marked as busy')
      }
 
      // Refresh notifications
      await fetchNotifications(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process room invite';
      console.error('Error handling room invite:', errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="relative">{ (
        <div className="md:h-full md:mr-1 fixed md:relative bottom-16 md:bottom-auto left-0 right-0 mx-2 backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-300">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ×
          </button>
        </div>
          <div className="space-y-4">
          {notifications.length > 0 ? (
              notifications.map((notification) => (
              <div
                key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.read ? 'bg-black/10' : 'bg-black/30'
                  } ${!notification.read && notification.type !== 'friend_request' && notification.type !== 'room_invite' ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!notification.read && notification.type !== 'friend_request' && notification.type !== 'room_invite') {
                      markNotificationAsRead(notification)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={notification.from_user?.avatar_url || '/default-avatar.png'}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p 
                        className="text-sm cursor-pointer" 
                        onClick={() => markNotificationAsRead(notification)}
                      >
                        <span className="font-medium">
                          {notification.from_user?.display_name || notification.from_user?.username}
                        </span>{' '}
                        {notification.content}
                      </p>
                      {!notification.read && (
                        <div className="flex gap-2 mt-2">
                          {notification.type === 'friend_request' && (
                            <>
                              <button
                                onClick={() => handleFriendRequest(notification.id, notification.from_user_id, true)}
                                className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleFriendRequest(notification.id, notification.from_user_id, false)}
                                className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {notification.type === 'room_invite' && (
                            <>
                              {notification.room && 
                               (notification.room.status === 'ended' || 
                                isRoomExpired(
                                  notification.metadata?.room_id || '', 
                                  notification.room.created_at, 
                                  notification.room.last_active
                                )) ? (
                                <span className="px-3 py-1 rounded bg-red-900/50 text-red-300 text-sm">
                                  Room Expired
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleRoomInvite(notification, 'join')}
                                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
                                  >
                                    Join
                                  </button>
                                  <button
                                    onClick={() => handleRoomInvite(notification, 'busy')}
                                    className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 transition-colors"
                                  >
                                    Busy
                                  </button>
                                </>
                              )}  
                            </>
                          )}
                        </div>
                      )}
                    </div>
                </div>
              </div>
            ))
          ) : (
              <div className="text-center text-gray-400">
              No notifications
            </div>
          )}
          </div>
        </div>
      </div>

      )}
    </div>
  )
}
