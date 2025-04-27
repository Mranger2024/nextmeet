'use client'

import { useState } from 'react'
import { MessageSquare, AlertTriangle, HelpCircle, Star, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type FeedbackType = 'general' | 'complaint' | 'bug'
type FaqCategory = 'account' | 'technical' | 'billing' | 'features'

interface FaqItem {
  question: string
  answer: string
  category: FaqCategory
}

export default function FeedbackPanel() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'faq'>('feedback')
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [rating, setRating] = useState<number>(0)
  const [message, setMessage] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('account')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const faqItems: FaqItem[] = [
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security and select "Change Password".',
      category: 'account'
    },
    {
      question: 'What video formats are supported?',
      answer: 'We support most common formats including MP4, WebM, and AVI.',
      category: 'technical'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'Visit the Billing section in Settings to manage your subscription.',
      category: 'billing'
    },
    {
      question: 'How do I start a group video call?',
      answer: 'Create a room and invite participants using the share button.',
      category: 'features'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) {
      toast.error('Please enter your message')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user.id,
            type: feedbackType,
            rating,
            message,
            status: 'pending'
          }
        ])

      if (error) throw error

      toast.success('Thank you for your feedback!')
      setMessage('')
      setRating(0)
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' && error && 'message' in error) 
          ? String(error.message) 
          : 'Failed to submit feedback'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full p-6 bg-color-900 backdrop-blur-lg overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Help & Feedback</h2>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeTab === 'feedback' ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeTab === 'faq' ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
          >
            FAQs
          </button>
        </div>

        {activeTab === 'feedback' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('general')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${feedbackType === 'general' ? 'bg-blue-500/20 text-blue-500 border border-blue-500' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
                >
                  <MessageSquare size={20} />
                  <span>General</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('complaint')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${feedbackType === 'complaint' ? 'bg-orange-500/20 text-orange-500 border border-orange-500' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
                >
                  <AlertTriangle size={20} />
                  <span>Complaint</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${feedbackType === 'bug' ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
                >
                  <HelpCircle size={20} />
                  <span>Bug</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`p-2 rounded-lg transition-all ${value <= rating ? 'text-yellow-500' : 'text-gray-600'}`}
                    >
                      <Star size={24} fill={value <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full h-32 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['account', 'technical', 'billing', 'features'] as FaqCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`py-2 px-4 rounded-lg whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {faqItems
                .filter((item) => item.category === selectedCategory)
                .map((item, index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{ height: expandedFaq === item.question ? 'auto' : '3rem' }}
                    className="overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === item.question ? null : item.question)}
                      className="w-full p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.question}</span>
                        <motion.span
                          animate={{ rotate: expandedFaq === item.question ? 180 : 0 }}
                          className="text-gray-400"
                        >
                          ▼
                        </motion.span>
                      </div>
                      {expandedFaq === item.question && (
                        <p className="mt-4 text-gray-400">{item.answer}</p>
                      )}
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}