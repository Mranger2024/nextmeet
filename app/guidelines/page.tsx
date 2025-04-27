'use client'

import { motion } from 'framer-motion'
import { Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react'

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0B0F] to-[#121218]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-12">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Community Guidelines
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Creating a safe, respectful, and enjoyable environment for everyone
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Our Community Values</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                At NextMeet, we&apos;re building a global community where people can connect through meaningful video conversations. To ensure everyone has a positive experience, we&apos;ve established these community guidelines that all users must follow.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                These guidelines help us maintain a platform where diversity is celebrated, privacy is respected, and users feel safe to express themselves authentically.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex items-center justify-center">
                    <Users size={120} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white text-center">Core Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Respect Everyone</h3>
                    <p className="text-gray-400">
                      Treat all users with respect and dignity. Harassment, hate speech, discrimination, or bullying based on race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, age, disability, medical condition, or any other characteristic is strictly prohibited.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Inappropriate Content</h3>
                    <p className="text-gray-400">
                      Do not share or display explicit sexual content, nudity, violence, gore, illegal activities, or any content that violates our terms of service. This applies to video, audio, text messages, and profile content.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border>-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>    
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Privacy Matters</h3>
                    <p className="text-gray-400">
                      Respect your privacy. Do not share personal information without consent, such as your real name, address, phone number, or email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
            