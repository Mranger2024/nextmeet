'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react'

export default function SecurityPage() {
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
              Security & Privacy
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Your safety is our top priority. Learn how we protect your privacy and security.
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Advanced Protection Systems</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                NextMeet employs state-of-the-art security measures to ensure your conversations remain private and your personal information stays secure. Our multi-layered approach to security includes end-to-end encryption, advanced authentication, and continuous monitoring for suspicious activity.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                We&apos;ve built our platform with privacy by design, meaning security isn&apos;t an afterthought—it&apos;s integrated into every aspect of NextMeet from the ground up.
              </p>
              <div className="pt-4">
                <Link 
                  href="/privacy-policy" 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity inline-block"
                >
                  View Privacy Policy
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="w-full h-full p-8 flex items-center justify-center">
                    <Shield size={120} className="text-blue-400" />
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
            <h2 className="text-3xl font-bold text-white text-center">Key Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Lock size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
                <p className="text-gray-400">
                  All video and audio communications on NextMeet are secured with end-to-end encryption, ensuring that only you and the person you&apos;re talking to can access your conversation.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Eye size={24} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Privacy Controls</h3>
                <p className="text-gray-400">
                  Take control of your experience with customizable privacy settings, including the ability to block users, control who can contact you, and manage your personal information.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Reporting System</h3>
                <p className="text-gray-400">
                  Our robust reporting system allows you to quickly report inappropriate behavior. Our moderation team reviews reports 24/7 to maintain a safe environment for all users.
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
                <h2 className="text-2xl font-bold text-white">Enhanced Security with Premium</h2>
                <p className="text-gray-400">
                  Upgrade to NextMeet Premium for additional security features:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Advanced identity verification</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Priority moderation response</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Enhanced privacy controls</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Secure cloud storage for shared files</span>
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
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <UserCheck size={80} className="text-white/70" />
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
            <h2 className="text-3xl font-bold text-white text-center">Our Security Commitment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Regular Security Audits</h3>
                    <p className="text-gray-400">
                      We conduct regular third-party security audits to identify and address potential vulnerabilities before they can be exploited.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Transparent Privacy Practices</h3>
                    <p className="text-gray-400">
                      We&apos;re committed to transparency about how we use your data. Our privacy policy is written in clear, understandable language, not legal jargon.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Continuous Improvement</h3>
                    <p className="text-gray-400">
                      Our security team constantly monitors emerging threats and evolves our protection systems to stay ahead of potential risks.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={24} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Minimization</h3>
                    <p className="text-gray-400">
                      We only collect the data necessary to provide our services. We don&apos;t sell your personal information to third parties or use it for advertising.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="text-center pt-12 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Have Security Concerns?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity">
                Contact Our Security Team
              </Link>
              <Link href="/guidelines" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
                View Community Guidelines
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}