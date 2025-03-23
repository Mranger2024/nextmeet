'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, Search, Heart, UserCircle, Settings, LogOut, Video, UsersRound, Bell, MessageSquare, Gift, Bot, FilePen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import HomePanel from './sidebar/HomePanel'
import ProfilePanel from './sidebar/ProfilePanel'
import FriendsPanel from './sidebar/FriendsPanel'
import GroupsPanel from './sidebar/GroupsPanel'
import RoomsPanel from './sidebar/RoomsPanel'
import PreferencesPanel from './sidebar/PreferencesPanel'
import Notifications from './Notifications'
import FindFriendsPanel from './sidebar/FindFriendsPanel'
import SettingsPanel from './sidebar/SettingsPanel'
import MessagesPanel from './sidebar/MessagesPanel'
import ReferralPanel from './sidebar/ReferralPanel'
import AIChatbotPanel from './sidebar/AIChatbotPanel'
import FeedbackPanel from './sidebar/FeedbackPanel'

import { getNotifications } from '@/lib/notifications'

type Panel = 'home' | 'profile' | 'friends' | 'groups' | 'rooms' | 'messages' | 'preferences' | 'settings' | 'find_friends' | 'referrals' | 'aichatbot' | 'feedback'

interface NavItem {
  id: Panel
  icon: React.ReactNode
  label: string
}

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<Panel>('home')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string; participants: any[]; is_group: boolean; created_at: string } | null>(null)
  const [isMobileDisabled, setIsMobileDisabled] = useState(false)
  const [hasZIndex, setHasZIndex] = useState(false)
  const router = useRouter()

  const navItems: NavItem[] = [
    { id: 'home', icon: <Home size={24} />, label: 'Home' },
    { id: 'profile', icon: <UserCircle size={24} />, label: 'Profile' },
    { id: 'find_friends', icon: <Search size={24} />, label: 'Find Friends' },
    { id: 'friends', icon: <Users size={24} />, label: 'Friends' },
    { id: 'groups', icon: <UsersRound size={24} />, label: 'Groups' },
    { id: 'rooms', icon: <Video size={24} />, label: 'Rooms' },
    { id: 'messages', icon: <MessageSquare size={24} />, label: 'Messages' },
    { id: 'preferences', icon: <Heart size={24} />, label: 'Preferences' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings' },
    { id: 'referrals', icon: <Gift size={24} />, label: 'Referrls' },
    { id: 'aichatbot', icon: <Bot size={24} />, label: 'Aichatbot' },
    { id: 'feedback', icon: <FilePen size={24} />, label: 'Feedback' }
  ]

  const handlePanelClick = (panel: Panel) => {
    if (activePanel === panel) {
      setIsPanelOpen(!isPanelOpen)
      if (!isPanelOpen) {
        setHasZIndex(false)
      }
    } else {
      setActivePanel(panel)
      setIsPanelOpen(true)
    }
    // Close notifications when opening a panel
    setShowNotifications(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/signin')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleSidebarInteraction = (panel: Panel) => {
    const event = new CustomEvent('endVideoChat')
    window.dispatchEvent(event)
    handlePanelClick(panel)
  }

    const toggleNotifications = () => {
      setShowNotifications(!showNotifications)
      // Close panel when opening notifications
      if (!showNotifications) {
        setIsPanelOpen(false)
      }
    }

  const fetchNotifications = () => {
    try {
      const notifications = getNotifications()
      setUnreadCount(notifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Set up an interval to check for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds

    // Listen for mobile sidebar disable/enable events
    const handleDisableMobileSidebar = () => setIsMobileDisabled(true)
    const handleEndVideoChat = () => setIsMobileDisabled(false)

    window.addEventListener('disableMobileSidebar', handleDisableMobileSidebar)
    window.addEventListener('endVideoChat', handleEndVideoChat)

    return () => {
      clearInterval(interval)
      window.removeEventListener('disableMobileSidebar', handleDisableMobileSidebar)
      window.removeEventListener('endVideoChat', handleEndVideoChat)
    }
  }, [])

  const renderPanel = () => {
    switch (activePanel) {
      case 'profile':
        return <ProfilePanel />
      case 'friends':
        return (
          <FriendsPanel 
            setActivePanel={setActivePanel} 
            setSelectedChat={setSelectedChat}
          />
        )
      case 'groups':
        return (
          <GroupsPanel 
            setActivePanel={setActivePanel} 
            setSelectedChat={setSelectedChat}
          />
        )
      case 'rooms':
        return <RoomsPanel />
      case 'messages':
        return (
          <MessagesPanel 
            selectedChat={selectedChat} 
            setSelectedChat={setSelectedChat}
          />
        )
      case 'preferences':
        return <PreferencesPanel />
      case 'home':
        return <HomePanel />  
      case 'find_friends':
        return <FindFriendsPanel />
      case 'settings':
        return <SettingsPanel />
      case 'referrals':
        return <ReferralPanel />
      case 'aichatbot':
        return <AIChatbotPanel />
      case 'feedback':
        return <FeedbackPanel />
      default:
        return null
    }
  }

  return (
    <div className={`fixed md:right-1 md:top-2 md:bottom-2 md:flex md:flex-row-reverse bottom-0 left-0 right-0 z-10 ${hasZIndex ? 'z-50' : 'z-10'} ${isMobileDisabled ? 'md:flex hidden' : ''}`} onClick={() => setHasZIndex(true)}>
      {/* Main Sidebar */}
      <div className={`md:h-full h-16 py-4 px-2 mx-2 mb-2 md:mb-0 bg-gradient-to-r from-[var(--sidebar-gradient-from)] via-[var(--sidebar-gradient-via)] to-[var(--sidebar-gradient-to)] backdrop-blur-2xl rounded-2xl flex md:flex-col flex-row justify-between transition-all duration-300 ${isExpanded ? 'md:w-64' : 'md:w-16'}`}>
        <div className="md:flex-1 flex md:flex-col flex-row items-center gap-3 overflow-x-auto md:overflow-x-visible scrollbar-hide">
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarInteraction(item.id)}
              className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${activePanel === item.id && isPanelOpen ? 'bg-[var(--active-bg)] text-[var(--active-text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        <div className="md:mt-3 flex md:flex-col flex-row items-center gap-4 ml-3 md:ml-0 flex-shrink-0">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-all relative"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-all text-red-400 hover:text-red-500"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>

      {/* Panel Container */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{
              width: window.innerWidth >= 768 ? 0 : '100%',
              height: window.innerWidth >= 768 ? '100%' : 0,
              y: window.innerWidth >= 768 ? 0 : '100%',
              opacity: 0
            }}
            animate={{
              width: window.innerWidth >= 768 ? 384 : '100%',
              height: window.innerWidth >= 768 ? '100%' : 'calc(100% - 5rem)',
              y: 0,
              opacity: 1
            }}
            exit={{
              width: window.innerWidth >= 768 ? 0 : '100%',
              height: window.innerWidth >= 768 ? '100%' : 0,
              y: window.innerWidth >= 768 ? 0 : '100%',
              opacity: 0
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:h-full md:mr-1 fixed md:relative bottom-16 md:bottom-auto left-0 right-0 mx-2 backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-300"
          >
            {renderPanel()}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Notifications Panel */}
      {showNotifications && (
        <Notifications
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}
