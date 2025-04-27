'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Community Manager',
      department: 'Operations',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      title: 'Content Writer',
      department: 'Marketing',
      location: 'Remote',
      type: 'Part-time'
    },
  ]

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
              Join Our Team
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Help us build the future of video communication
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Why Work With Us</h2>
              <p className="text-lg text-gray-400 leading-relaxed">
                At NextMeet, we&apos;re building technology that connects people across the globe through seamless video experiences. Our team is passionate about creating products that make meaningful connections possible, regardless of distance or background.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                We believe in fostering a culture of innovation, inclusivity, and continuous learning. Our remote-first approach allows us to bring together the best talent from around the world, creating a diverse team with unique perspectives.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-1">
              <div className="bg-gray-900 rounded-xl h-full w-full p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Competitive Salary</h3>
                    <p className="text-gray-400">
                      We offer competitive compensation packages that recognize your skills and contributions.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Remote-First</h3>
                    <p className="text-gray-400">
                      Work from anywhere in the world with flexible hours that fit your lifestyle.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                    <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Growth Opportunities</h3>
                    <p className="text-gray-400">
                      Continuous learning and career advancement paths for all team members.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-lg border border-gray-700/50">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Work-Life Balance</h3>
                    <p className="text-gray-400">
                      Generous PTO, mental health days, and flexible scheduling to maintain balance.
                    </p>
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
            <h2 className="text-3xl font-bold text-white">Open Positions</h2>
            <div className="grid grid-cols-1 gap-4">
              {openPositions.map((position, index) => (
                <div 
                  key={index}
                  className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{position.department}</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">{position.location}</span>
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">{position.type}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/careers/${position.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#4F4FFF] to-[#845EFF] text-white font-medium hover:opacity-90 transition-opacity text-center md:text-left"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white">Our Culture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Collaborative Environment</h3>
                  <p className="text-gray-400">
                    We foster a culture of collaboration, where ideas flow freely and every voice is heard and valued.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Continuous Learning</h3>
                  <p className="text-gray-400">
                    We invest in our team&apos;s growth with learning stipends, conference attendance, and skill development opportunities.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-pink-500/30 to-blue-500/30 flex items-center justify-center">
                  <svg className="w-24 h-24 text-white/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Diversity and Inclusion</h3>
                  <p className="text-gray-400">
                    We are committed to creating an inclusive workplace where everyone feels valued and respected.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}