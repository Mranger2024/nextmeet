'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Star, Crown, Sparkles, Clock, Shield } from 'lucide-react'

export default function PremiumFeaturesPage() {
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
              Premium Features
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Unlock the full potential of NextMeet with our premium subscription
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Elevate Your Experience</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                NextMeet Premium takes your video chat experience to the next level with exclusive features designed for users who want more control, better connections, and enhanced capabilities.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Whether you&apos;re using NextMeet for socializing, language exchange, or professional networking, our premium features help you make the most of every conversation.
              </p>
              <div className="pt-4">
                <Link 
                  href="/dashboard/subscription" 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity inline-block"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex items-center justify-center">
                    <Crown size={120} className="text-yellow-400" />
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
            <h2 className="text-3xl font-bold text-white text-center">Premium Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Star size={24} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Priority Matching</h3>
                <p className="text-gray-400">
                  Get matched with other users faster and enjoy priority in our matching queue. Premium users are also matched with higher compatibility scores.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Clock size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Unlimited Chat Time</h3>
                <p className="text-gray-400">
                  Enjoy unlimited video chat duration with no time restrictions. Continue your conversations for as long as you want without interruptions.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Shield size={24} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Enhanced Security</h3>
                <p className="text-gray-400">
                  Benefit from additional security features including advanced identity verification and priority moderation response.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white text-center">More Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={24} className="text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Advanced Filters</h3>
                    <p className="text-gray-400">
                      Access additional matching filters including interests, language proficiency levels, and more specific preferences for better connections.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">See Who Liked You</h3>
                    <p className="text-gray-400">
                      View a list of users who are interested in connecting with you, giving you more control over your matching experience.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Scheduled Meetings</h3>
                    <p className="text-gray-400">
                      Plan ahead by scheduling video chats with your connections. Set up language practice sessions or catch-ups at convenient times.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">HD Video Quality</h3>
                    <p className="text-gray-400">
                      Enjoy the highest video quality available, with priority bandwidth allocation for smoother, clearer conversations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Pricing Plans</h2>
                <p className="text-gray-400">
                  Choose the plan that&apos;s right for you:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Monthly</h3>
                        <p className="text-gray-400">Flexible month-to-month billing</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">$9.99</span>
                        <p className="text-gray-400">per month</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Annual</h3>
                        <p className="text-gray-400">Save 33% with yearly billing</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">$79.99</span>
                        <p className="text-gray-400">per year</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link 
                    href="/dashboard/subscription" 
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity inline-block"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gradient-to-r from-yellow-500/30 to-purple-500/30 flex items-center justify-center">
                  <Zap size={80} className="text-white/70" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>    
    </div>
    )
 }