'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import FloatingChatbot from '@/components/FloatingChatbot'
import Logo from '@/components/ui/Logo'  

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141522] via-[#0F1117] to-[#080A0F] relative">
      <div className="geometric-shapes" />
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
        ))}
      </div>
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2">
             <Logo size="lg" withText={false} />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text">
                NEXTMEET
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/safety" className="text-gray-300 hover:text-white transition-colors">
                Safety
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button
                  onClick={() => router.push('/video-chat')}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(138,137,255,0.3)] shadow-[0_0_8px_rgba(138,137,255,0.2)]"
                >
                  Start Chat
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/signin')}
                    className="px-6 py-2.5 rounded-lg text-white font-medium hover:text-gray-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(138,137,255,0.3)] shadow-[0_0_8px_rgba(138,137,255,0.2)]"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text">
              Most Advanced Random
              <br />
              Video Chat Platform
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect with people worldwide through high-quality video chat. Experience real
              conversations with advanced matching algorithms and premium features.
            </p>

            <div className="flex items-center justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(isLoggedIn ? '/video-chat' : '/signin')}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-white font-medium text-lg transition-all hover:shadow-[0_0_24px_rgba(138,137,255,0.3)] shadow-[0_0_12px_rgba(138,137,255,0.2)]"
              >
                Start Chatting Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/features')}
                className="px-8 py-4 rounded-full bg-gray-800/50 text-white font-medium text-lg transition-all hover:bg-gray-800/70 backdrop-blur-sm"
              >
                Explore Features
              </motion.button>
            </div>
          </motion.div>

          {/* Statistics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-bold text-white">2M+</h3>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-bold text-white">150+</h3>
              <p className="text-gray-400">Countries</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-bold text-white">10M+</h3>
              <p className="text-gray-400">Daily Chats</p>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-bold text-white">4.8/5</h3>
              <p className="text-gray-400">User Rating</p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">HD Video Quality</h3>
              <p className="text-gray-400">
                Experience crystal clear video and audio quality with our advanced streaming technology. Enjoy smooth, lag-free conversations in up to 4K resolution.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Smart Matching</h3>
              <p className="text-gray-400">
                Our AI-powered matching algorithm connects you with like-minded people based on interests, language, and preferences. Find meaningful connections instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Secure & Private</h3>
              <p className="text-gray-400">
                Your privacy is our priority. Enjoy end-to-end encryption, advanced privacy controls, and moderation systems for a safe chatting environment.
              </p>
            </div>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-32 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold text-white">Create Account</h3>
                <p className="text-gray-400">Sign up in seconds with your email or social media account. No complicated setup required.</p>
              </div>
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#845EFF] to-[#A455FF] flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold text-white">Set Preferences</h3>
                <p className="text-gray-400">Choose your interests, preferred languages, and matching preferences for better connections.</p>
              </div>
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#A455FF] to-[#4F4FFF] flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-xl font-semibold text-white">Start Chatting</h3>
                <p className="text-gray-400">Click the start button and get instantly connected with new friends worldwide.</p>
              </div>
            </div>
          </motion.div>
          {/* Pricing Plans */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-32 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">Select the perfect plan for your needs. Upgrade or downgrade anytime.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-6 hover:transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-semibold text-white">Free</h3>
                <div className="text-4xl font-bold text-white">$0<span className="text-lg font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-4 text-left">
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Basic video quality
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    5 matches per day
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Basic chat features
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 px-4 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Get Started
                </button>
              </div>

              {/* Premium Plan */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1A1C24] to-[#141522] border border-[#845EFF] space-y-6 transform scale-105 relative hover:transform hover:scale-110 transition-all duration-300">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white text-sm font-medium px-4 py-1 rounded-full">Most Popular</div>
                <h3 className="text-2xl font-semibold text-white">Premium</h3>
                <div className="text-4xl font-bold text-white">$9.99<span className="text-lg font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-4 text-left">
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-[#845EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    HD video quality
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-[#845EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited matches
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-[#845EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced filters
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-[#845EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    No ads
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/signup?plan=premium')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] rounded-lg text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(138,137,255,0.3)] shadow-[0_0_8px_rgba(138,137,255,0.2)]"
                >
                  Get Premium
                </button>
              </div>

              {/* Business Plan */}
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-6 hover:transform hover:scale-105 transition-all duration-300">
                <h3 className="text-2xl font-semibold text-white">Business</h3>
                <div className="text-4xl font-bold text-white">$29.99<span className="text-lg font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-4 text-left">
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    4K video quality
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Group video calls
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Custom branding
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/signup?plan=business')}
                  className="w-full py-3 px-4 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-32 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of satisfied users who have found meaningful connections on our platform.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 italic">"I've met amazing people from all over the world. The video quality is incredible and the matching system really works!"</p>
                <div className="text-white font-medium">Sarah M.</div>
                <div className="text-gray-500 text-sm">Premium User</div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 italic">"The security features give me peace of mind, and I love how easy it is to find people with similar interests."</p>
                <div className="text-white font-medium">John D.</div>
                <div className="text-gray-500 text-sm">Business User</div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-white/10 space-y-4">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 italic">"The security features give me peace of mind, and I love how easy it is to find people with similar interests."</p>
                <div className="text-white font-medium">John D.</div>
                <div className="text-gray-500 text-sm">Business User</div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-32 text-center bg-gradient-to-r from-[#1A1C24] via-[#141522] to-[#1A1C24] rounded-3xl p-12 border border-white/10"
      >
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Join millions of users worldwide and start making meaningful connections today.
          Your next great conversation is just a click away.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/signup')}
          className="px-8 py-4 rounded-full bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-white font-medium text-lg transition-all hover:shadow-[0_0_24px_rgba(138,137,255,0.3)] shadow-[0_0_12px_rgba(138,137,255,0.2)]"
        >
          Create Free Account
        </motion.button>
      </motion.div>
      {/* Footer */}
      <footer className="bg-[#0A0B0F] border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-block">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] flex items-center justify-center">
                   <Logo size="md" withText={false} />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text">
                    NEXTMEET
                  </span>
                </div>
              </Link>
              <p className="text-gray-400 text-lg leading-relaxed">
                NEXTMEET is the world&apos;s leading platform for random video chat, connecting millions of users worldwide through AI-powered matching and high-quality video streaming.
              </p>
              <div className="flex items-center space-x-4">
                <a href="https://twitter.com/nextmeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="https://facebook.com/nextmeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/nextmeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="https://linkedin.com/company/nextmeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-8">
          <div className="space-y-4">
           <h3 className="text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-2">
             <li>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About Us
              </Link>
             </li>
             <li>
              <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                Careers
              </Link>
             </li>
             <li>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
             </li>
             <li>
              <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
             </li>
            </ul>
          </div>

          <div className="space-y-4">
           <h3 className="text-lg font-semibold text-white">Features</h3>
            <ul className="space-y-2">
             <li>
              <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                Video Chat
              </Link>
             </li>
             <li>
              <Link href="/features/matching" className="text-gray-400 hover:text-white transition-colors">
                Smart Matching
              </Link>
             </li>
             <li>
              <Link href="/features/security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
             </li>
             <li>
              <Link href="/features/premium" className="text-gray-400 hover:text-white transition-colors">
                Premium Features
              </Link>
             </li>
            </ul>
          </div>

          <div className="space-y-4">
           <h3 className="text-lg font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
             <li>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
             </li>
             <li>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
             </li>
             <li>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
             </li>
             <li>
              <Link href="/guidelines" className="text-gray-400 hover:text-white transition-colors">
                Community Guidelines
              </Link>
             </li>
            </ul>
          </div>

          <div className="space-y-4">
           <h3 className="text-lg font-semibold text-white">Connect</h3>
            <ul className="space-y-2">
              <li>
              <a href="https://instagram.com/nextmeet" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
             </li>
            </ul>
          </div>
         </div>
        </div>

        <div className="h-10 mt-12 pt-8 border-t border-white/10 ">
         <div className="text-gray-400 text-sm text-center">
          &copy; {new Date().getFullYear()} NextMeet. All rights reserved.
         </div> 
        </div>
        </div>
      </footer>
    </div>
  )
}
