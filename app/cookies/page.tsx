'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CookiePolicyPage() {
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
              Cookie Policy
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              How we use cookies and similar technologies
            </motion.p>
          </div>

          <motion.div 
            className="prose prose-lg prose-invert max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700/50 space-y-6">
              <h2 className="text-2xl font-bold text-white">What Are Cookies?</h2>
              <p className="text-gray-400">
                Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners. Cookies enhance your browsing experience by allowing websites to remember your preferences and understand how you interact with their services.
              </p>
              
              <h2 className="text-2xl font-bold text-white mt-8">How NextMeet Uses Cookies</h2>
              <p className="text-gray-400">
                At NextMeet, we use cookies and similar technologies for various purposes, including:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                  <p className="text-gray-400">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies as the website cannot function properly without them.
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-2">Performance and Analytics Cookies</h3>
                  <p className="text-gray-400">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve the quality and performance of our services by providing insights on which pages are most popular, tracking error messages, and testing different design features.
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-2">Functionality Cookies</h3>
                  <p className="text-gray-400">
                    These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you disable these cookies, some or all of these services may not function properly.
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-2">Targeting and Advertising Cookies</h3>
                  <p className="text-gray-400">
                    These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They do not directly store personal information but are based on uniquely identifying your browser and internet device.
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mt-8">Third-Party Cookies</h2>
              <p className="text-gray-400">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on. These cookies may track your browsing habits across different websites and online services.
              </p>
              
              <h2 className="text-2xl font-bold text-white mt-8">Managing Cookies</h2>
              <p className="text-gray-400">
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mt-4">
                <h3 className="text-xl font-semibold text-white mb-2">Browser Settings</h3>
                <p className="text-gray-400">
                  You can manage cookies through your browser settings. Here&apos;s how to do it in popular browsers:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-400">
                  <li>Google Chrome: Settings → Privacy and Security → Cookies and other site data</li>
                  <li>Mozilla Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                  <li>Safari: Preferences → Privacy → Cookies and website data</li>
                  <li>Microsoft Edge: Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>
              
              <h2 className="text-2xl font-bold text-white mt-8">Cookie Consent</h2>
              <p className="text-gray-400">
                When you first visit our website, you will be shown a cookie banner requesting your consent to set cookies according to this policy. You can change your preferences at any time by clicking on the &quot;Cookie Settings&quot; link in the footer of our website.
              </p>
              
              <h2 className="text-2xl font-bold text-white mt-8">Changes to Our Cookie Policy</h2>
              <p className="text-gray-400">
                We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
              
              <h2 className="text-2xl font-bold text-white mt-8">Contact Us</h2>
              <p className="text-gray-400">
                If you have any questions about our Cookie Policy, please contact us at:
              </p>
              <div className="mt-2">
                <Link 
                  href="/contact" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Contact Page
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="text-center pt-12 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Related Policies</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy-policy" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
                Terms of Service
              </Link>
              <Link href="/guidelines" className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
                Community Guidelines
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}