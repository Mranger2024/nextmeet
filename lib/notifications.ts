export interface Notification {
  id: string
  type: 'friend_request' | 'message' | 'call' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
}

const NOTIFICATIONS_KEY = 'user_notifications'

export const getNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!stored) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]))
      return []
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading notifications:', error)
    return []
  }
}

export const addNotification = (notification: Omit<Notification, 'id' | 'created_at'>) => {
  if (typeof window === 'undefined') return false

  try {
    const notifications = getNotifications()
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 15),
      created_at: new Date().toISOString()
    }
    
    notifications.unshift(newNotification)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
    return true
  } catch (error) {
    console.error('Error adding notification:', error)
    return false
  }
}

export const markAsRead = (id: string) => {
  if (typeof window === 'undefined') return false

  try {
    const notifications = getNotifications()
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export const markAllAsRead = () => {
  if (typeof window === 'undefined') return false

  try {
    const notifications = getNotifications()
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

export const deleteNotification = (id: string) => {
  if (typeof window === 'undefined') return false

  try {
    const notifications = getNotifications()
    const updated = notifications.filter(n => n.id !== id)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

export const clearNotifications = () => {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]))
    return true
  } catch (error) {
    console.error('Error clearing notifications:', error)
    return false
  }
}
