'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AboutPage() {
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
              About NextMeet
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Connecting people through seamless video chat experiences
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                At NextMeet, we&apos;re on a mission to break down barriers and connect people from all corners of the world through high-quality video interactions. We believe that meaningful connections can happen anywhere, and our platform is designed to make those connections possible, accessible, and safe for everyone.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Founded in 2023, NextMeet has quickly grown to become a leading platform for random video chatting, with millions of users worldwide trusting us to connect them with new friends, language partners, and like-minded individuals.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] flex items-center justify-center mb-4">
                      <span className="text-4xl font-bold text-white">N</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">NextMeet</h3>
                    <p className="text-gray-400">Established 2023</p>
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
            <h2 className="text-3xl font-bold text-white">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Safety First</h3>
                <p className="text-gray-400">
                  We prioritize user safety with advanced moderation systems, clear community guidelines, and robust reporting tools to ensure a positive experience for everyone.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Global Connections</h3>
                <p className="text-gray-400">
                  We believe in the power of cross-cultural communication and strive to connect people across geographical, linguistic, and cultural boundaries.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Privacy & Trust</h3>
                <p className="text-gray-400">
                  We respect user privacy and are committed to transparent data practices, giving our users control over their information and building trust through accountability.
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
            <h2 className="text-3xl font-bold text-white">Our Team</h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-4xl">
              NextMeet is powered by a diverse team of engineers, designers, and community specialists who are passionate about creating meaningful connections in the digital world. Our team spans multiple countries and time zones, bringing together a wealth of experiences and perspectives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/30 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-white">Alex Johnson</h3>
                <p className="text-gray-400">Founder & CEO</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-white">Sarah Chen</h3>
                <p className="text-gray-400">CTO</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-pink-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-white">Miguel Rodriguez</h3>
                <p className="text-gray-400">Head of Design</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-green-600 mb-4"></div>
                <h3 className="text-xl font-semibold text-white">Aisha Patel</h3>
                <p className="text-gray-400">Community Director</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="text-center pt-12 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Join Our Journey</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers" className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity">
                View Careers
              </Link>
              <Link href="/contact" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0B0F] border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-block">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">N</span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text">
                    NEXTMEET
                  </span>
                </div>
              </Link>
              <p className="text-gray-400 text-lg leading-relaxed">
                NEXTMEET is the world&apos;s leading platform for random video chat, connecting millions of users worldwide through AI-powered matching and high-quality video streaming.
              </p>
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
                    <Link href="/guidelines" className="text-gray-400 hover:text-white transition-colors">
                      Guidelines
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Social</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="URL_ADDRESS.com/nextmeetapp" className="text-gray-400 hover:text-white transition-colors">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link href="URL_ADDRESS.com/nextmeetapp" className="text-gray-400 hover:text-white transition-colors">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link href="URL_ADDRESS.com/nextmeetapp" className="text-gray-400 hover:text-white transition-colors">
                      Twitter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}