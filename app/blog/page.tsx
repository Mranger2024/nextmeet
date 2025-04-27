'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  readTime: string
  image: string
}

export default function BlogPage() {
  // Sample blog posts data
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Introducing NextMeet Premium: Elevate Your Video Chat Experience',
      excerpt: 'We are excited to announce the launch of NextMeet Premium, offering enhanced features for a more personalized video chat experience.',
      date: 'March 10, 2025',
      author: 'Alex Johnson',
      category: 'Product Updates',
      readTime: '5 min read',
      image: 'gradient-blue'
    },
    {
      id: '2',
      title: 'How We are Making Video Chat Safer for Everyone',
      excerpt: 'At NextMeet, user safety is our top priority. Learn about our latest security measures and community guidelines.',
      date: 'February 28, 2025',
      author: 'Sarah Chen',
      category: 'Security',
      readTime: '8 min read',
      image: 'gradient-purple'
    },
    {
      id: '3',
      title: 'The Future of Online Connections: AI-Powered Matching',
      excerpt: 'Discover how our advanced AI algorithms are revolutionizing the way people connect online through smart matching technology.',
      date: 'February 15, 2025',
      author: 'Miguel Rodriguez',
      category: 'Technology',
      readTime: '6 min read',
      image: 'gradient-pink'
    },
    {
      id: '4',
      title: 'Building Community Through Video: Success Stories',
      excerpt: 'Read inspiring stories from users who have formed meaningful connections through NextMeets video chat platform.',
      date: 'January 30, 2025',
      author: 'Aisha Patel',
      category: 'Community',
      readTime: '7 min read',
      image: 'gradient-green'
    },
    {
      id: '5',
      title: 'Remote Work Revolution: How Video Chat is Changing Business',
      excerpt: 'Explore how video communication tools like NextMeet are transforming remote work and business collaboration.',
      date: 'January 15, 2025',
      author: 'Alex Johnson',
      category: 'Business',
      readTime: '9 min read',
      image: 'gradient-orange'
    },
    {
      id: '6',
      title: 'NextMeets 2025 Roadmap: Whats Coming Next',
      excerpt: 'Get a sneak peek at our exciting plans for 2025, including new features, improvements, and expansion goals.',
      date: 'January 5, 2025',
      author: 'Sarah Chen',
      category: 'Product Updates',
      readTime: '4 min read',
      image: 'gradient-blue'
    },
  ]

  const categories = ['All', 'Product Updates', 'Security', 'Technology', 'Community', 'Business']

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
              NextMeet Blog
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Insights, updates, and stories from the world of video communication
            </motion.p>
          </div>

          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full ${index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'} transition-all`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {blogPosts.map((post) => (
              <Link 
                href={`/blog/${post.id}`} 
                key={post.id}
                className="group"
              >
                <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/50 group-hover:border-blue-500/50 transition-all h-full flex flex-col">
                  <div className={`h-48 ${post.image === 'gradient-blue' ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30' : 
                    post.image === 'gradient-purple' ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30' :
                    post.image === 'gradient-pink' ? 'bg-gradient-to-r from-pink-500/30 to-red-500/30' :
                    post.image === 'gradient-green' ? 'bg-gradient-to-r from-green-500/30 to-blue-500/30' :
                    'bg-gradient-to-r from-orange-500/30 to-yellow-500/30'}`}>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-blue-400">{post.category}</span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                    <p className="text-gray-400 mb-6 flex-1">{post.excerpt}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700/50">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <span className="text-sm text-gray-400">{post.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <button className="px-6 py-3 rounded-lg bg-gray-800/50 text-white font-medium hover:bg-gray-800/70 transition-colors">
              Load More Articles
            </button>
          </div>

          <motion.div 
            className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Subscribe to Our Newsletter</h2>
                <p className="text-gray-400">
                  Stay updated with the latest features, tips, and stories from NextMeet. We promise not to spam your inbox!
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-3 rounded-l-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
                  />
                  <button className="px-6 py-3 rounded-r-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates from NextMeet.
                </p>
              </div>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}