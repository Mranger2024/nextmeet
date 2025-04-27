'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Heart, Sparkles, Filter } from 'lucide-react'

export default function SmartMatchingPage() {
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
              Smart Matching
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Connect with people who share your interests and preferences
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">AI-Powered Connections</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                Our advanced matching algorithm learns from your preferences and interactions to connect you with people you&apos;re most likely to enjoy talking to. The more you use NextMeet, the better our matching becomes.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Unlike random matching services, NextMeet&apos;s Smart Matching considers dozens of factors including interests, conversation style, language preferences, and past successful connections to create meaningful video chat experiences.
              </p>
              <div className="pt-4">
                <Link 
                  href="/signup" 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity inline-block"
                >
                  Try Smart Matching
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex items-center justify-center">
                    <Brain size={120} className="text-purple-400" />
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
            <h2 className="text-3xl font-bold text-white text-center">How Smart Matching Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Filter size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Preference Analysis</h3>
                <p className="text-gray-400">
                  Set your preferences for age range, interests, languages, and more. Our system uses these as the foundation for finding your matches.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Brain size={24} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Behavioral Learning</h3>
                <p className="text-gray-400">
                  Our AI observes which conversations you enjoy most and adapts to find similar connections in the future, continuously improving your matches.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Compatibility Scoring</h3>
                <p className="text-gray-400">
                  Each potential match receives a compatibility score based on multiple factors, ensuring you connect with people you&apos;re most likely to click with.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Premium Matching</h2>
                <p className="text-gray-400">
                  Upgrade to NextMeet Premium for enhanced matching features including:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Priority matching with high-compatibility users</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Advanced filters for more precise matching</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">See who&apos;s interested in matching with you</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Save favorite matches for future connections</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link 
                    href="/dashboard/subscription" 
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity inline-block"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <Heart size={80} className="text-white/70" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white text-center">User Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Sarah K.</h3>
                    <p className="text-gray-400 mb-4">
                    &quot;I was skeptical about AI matching at first, but NextMeet connected me with people who share my passion for photography. I&apos;ve made friends from around the world who give me feedback on my work!&quot;
                    </p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Miguel T.</h3>
                    <p className="text-gray-400 mb-4">
                    &quot;As a language learner, I wanted to practice with native speakers. NextMeet&apos;s smart matching found me perfect conversation partners who were patient and helpful with my Spanish practice.&quot;
                    </p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
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