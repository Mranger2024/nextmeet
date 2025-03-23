'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from './ui/Logo'

export default function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full px-6 py-4 backdrop-blur-lg bg-gray-900/80 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo size="md" />
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          >
            Home
          </Link>
          <Link
            href="/video-chat"
            className={`text-sm font-medium transition-colors ${isActive('/video-chat') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          >
            Video Chat
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          >
            Contact
          </Link>
          <Link
            href="/terms"
            className={`text-sm font-medium transition-colors ${isActive('/terms') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          >
            Terms
          </Link>
          <Link
            href="/privacy-policy"
            className={`text-sm font-medium transition-colors ${isActive('/privacy-policy') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
          >
            Privacy
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <Link
            href="/signin"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium text-white"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}