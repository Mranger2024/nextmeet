'use client'

import { motion } from 'framer-motion'
import { Bell, Rocket, Gift, MessageSquare, Bot } from 'lucide-react'
import { useState } from 'react'

interface RoadmapItem {
  icon: React.ReactNode
  title: string
  description: string
  date: string
  status: 'completed' | 'in-progress' | 'upcoming'
}

interface Alert {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  date: string
}

export default function HomePanel() {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'New Feature Alert!',
      message: 'AI Chatbot is now available for all premium users',
      type: 'success',
      date: 'Today'
    },
    {
      id: '2',
      title: 'Coming Soon',
      message: 'Enhanced messaging system with voice messages',
      type: 'info',
      date: 'Next Week'
    }
  ])

  const roadmapItems: RoadmapItem[] = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Enhanced Messaging',
      description: 'Real-time chat with voice messages and file sharing',
      date: 'April 2025',
      status: 'in-progress'
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'Referral Program',
      description: 'Earn rewards by inviting friends',
      date: 'April 2025',
      status: 'upcoming'
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: 'AI Improvements',
      description: 'Enhanced AI chatbot with voice recognition',
      date: 'March 2025',
      status: 'completed'
    }
  ]

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-b from-[var(--panel-bg)] to-[var(--panel-bg-secondary)]">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome to NextMeet</h1>
        <p className="text-[var(--text-secondary)]">Stay updated with our latest features and improvements</p>
      </motion.div>

      {/* Alerts Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Announcements
        </h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-4 rounded-xl backdrop-blur-lg ${alert.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{alert.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{alert.message}</p>
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{alert.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Roadmap Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5" /> Feature Roadmap
        </h2>
        <div className="space-y-4">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 rounded-xl backdrop-blur-lg bg-[var(--panel-bg-accent)]/50 border border-[var(--border-color)]"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${item.status === 'completed' ? 'bg-green-500/20' : item.status === 'in-progress' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[var(--text-primary)]">{item.title}</h3>
                    <span className="text-sm text-[var(--text-secondary)]">{item.date}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <span className="text-xs text-[var(--text-secondary)] capitalize">{item.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}