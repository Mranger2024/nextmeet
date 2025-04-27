'use client'

import { motion } from 'framer-motion'
import { CalendarClock } from 'lucide-react'

interface ComingSoonPanelProps {
  feature: string
}

export default function ComingSoonPanel({ feature }: ComingSoonPanelProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center overflow-auto p-8 bg-gradient-to-b from-[var(--panel-bg)] to-[var(--panel-bg-secondary)] text-center">
      <motion.div 
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-2"
      >
        <CalendarClock size={64} className="mt-10 text-[var(--text-primary)]" />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-4 text-[var(--text-primary)]"
      >
        {feature} Coming Soon!
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[var(--text-secondary)] mb-8"
      >
        We&apos;re working hard to bring you an amazing experience.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6 w-full"
      >
        {/* Roadmap Section */}
        <div className="bg-[var(--panel-bg-accent)] p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold mb-4 text-[var(--text-primary)]">Roadmap</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3" />
              <p className="text-sm text-[var(--text-secondary)]">Development in Progress</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
              <p className="text-sm text-[var(--text-secondary)]">Testing & Refinement</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
              <p className="text-sm text-[var(--text-secondary)]">Launch by End of April 2025</p>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="bg-[var(--panel-bg-accent)] p-6 rounded-xl shadow-lg">
          <h3 className="font-semibold mb-4 text-[var(--text-primary)]">
            {feature === "Messaging System" ? "Key Features" : "Referral Program Benefits"}
          </h3>
          <div className="space-y-4">
            {feature === "Messaging System" ? (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Real-time Messaging</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Instant message delivery with typing indicators and read receipts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">File Sharing</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Share images, documents, and media files securely</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">End-to-End Encryption</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Your conversations are always private and secure</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Commission Rates</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Earn up to 30% commission on referred user subscriptions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Reward Tiers</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Unlock higher commissions and bonuses as you refer more users</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">Real-time Analytics</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Track your referrals and earnings with detailed analytics</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}