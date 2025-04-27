'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { countries } from '@/lib/countries'

// Define a type for Supabase errors
interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface Preferences {
  id: string
  user_id: string
  gender_preference: 'any' | 'male' | 'female' | 'other'
  country_preference: string
  interests: string[]
  created_at: string
  updated_at: string
}

export default function PreferencesPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<Preferences | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        toast.error('Please sign in to view preferences')
        return
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Create default preferences if none exist
          const defaultPrefs = {
            user_id: user.id,
            gender_preference: 'any',
            country_preference: '',
            interests: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data: newPrefs, error: insertError } = await supabase
            .from('user_preferences')
            .insert([defaultPrefs])
            .select()
            .single()

          if (insertError) throw insertError
          setPreferences(newPrefs)
          return
        }
        throw error
      }

      setPreferences(data)
    } catch (error) {
      const err = error as SupabaseError;
      console.error('Error fetching preferences:', err.message || error)
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = async (key: keyof Preferences, value: string | string[]) => {
    try {
      if (!preferences?.id) return

      const { error } = await supabase
        .from('user_preferences')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('id', preferences.id)

      if (error) throw error

      setPreferences(prev => prev ? { ...prev, [key]: value } : null)
      toast.success('Preference updated')
    } catch (error) {
      const err = error as SupabaseError;
      console.error('Error updating preference:', err.message || error)
      toast.error('Failed to update preference')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Heart className="mx-auto mb-2" size={24} />
        <p>Unable to load preferences</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Preferences</h3>

      <div className="space-y-6">
        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Gender Preference</label>
          <select
            value={preferences.gender_preference}
            onChange={(e) => updatePreference('gender_preference', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Country Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Country Preference</label>
          <select
            value={preferences.country_preference}
            onChange={(e) => updatePreference('country_preference', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Interests</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Gaming', 'Music', 'Sports', 'Technology',
              'Art', 'Travel', 'Food', 'Fashion',
              'Literature', 'Movies', 'Science', 'Fitness'
            ].map((interest) => (
              <label
                key={interest}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  preferences.interests.includes(interest)
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences.interests.includes(interest)}
                  onChange={() => {
                    const newInterests = preferences.interests.includes(interest)
                      ? preferences.interests.filter(i => i !== interest)
                      : [...preferences.interests, interest]
                    updatePreference('interests', newInterests)
                  }}
                  className="sr-only"
                />
                <span className="text-sm">{interest}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}