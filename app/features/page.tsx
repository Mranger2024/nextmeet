'use client'

import { motion } from 'framer-motion'
import { Video } from 'lucide-react'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0B0F] to-[#121218]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="space-y-16">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Video Chat Features
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Connect with anyone, anywhere with our cutting-edge video chat platform
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Crystal Clear HD Video</h2>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex items-center justify-center">
                    <Video size={120} className="text-blue-400" />
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