'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { toast } from 'react-hot-toast';

interface BetaSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
}

export default function BetaSubscriptionForm({ isOpen, onClose, userId }: BetaSubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    country: '',
    gender: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For mobile number, only allow digits and limit to 10 characters
    if (name === 'mobileNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly.slice(0, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Fetch user profile data if userId is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('country, gender')
            .eq('id', userId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormData(prev => ({
              ...prev,
              country: data.country || '',
              gender: data.gender || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Insert data into beta_subscriptions table
      const { error } = await supabase
        .from('beta_subscriptions')
        .insert({
          user_id: userId,
          name: formData.name,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          country: formData.country,
          gender: formData.gender,
        });
      
      if (error) {
        // Safely log error details with proper type checking
        console.error('Supabase error details:', {
          message: typeof error.message === 'string' ? error.message : 'No message available',
          code: typeof error.code === 'string' ? error.code : 'No code available',
          details: error.details || null,
          hint: error.hint || null
        });
        throw error;
      }
      
      toast.success('Thank you for joining our beta program!');
      onClose();
    } catch (error: unknown) {
      // Safely extract error information with type guards for unknown type
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? (error.message as string) || 'Unknown error occurred'
        : 'Unknown error occurred';
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? (error.code as string) || 'unknown_error'
        : 'unknown_error';
      
      // Log structured error information
      console.error('Error submitting beta subscription:', {
        message: errorMessage,
        code: errorCode,
        details: typeof error === 'object' && error !== null && 'details' in error ? error.details : null,
        hint: typeof error === 'object' && error !== null && 'hint' in error ? error.hint as string : null,
        status: typeof error === 'object' && error !== null && 'status' in error ? error.status as number : null,
        name: typeof error === 'object' && error !== null && 'name' in error ? error.name as string : 'Error'
      });
      
      // Show user-friendly error message
      let userMessage = 'Failed to submit';
      if (errorCode === '23505') {
        userMessage = 'This email is already registered for the beta program';
      } else if (errorCode === '23503') {
        userMessage = 'Invalid user information';
      } else if (errorCode === '23502') {
        userMessage = 'Please fill in all required fields';
      } else {
        userMessage = `${userMessage}: ${errorMessage}`;
      }
      
      toast.error(userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Join Our Beta Program</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-300 mb-1">Mobile Number (10 digits)</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-800 border ${errors.mobileNumber ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                placeholder="Enter your 10-digit mobile number"
                maxLength={10}
              />
              {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>}
            </div>
            
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] rounded-lg text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(138,137,255,0.3)] shadow-[0_0_8px_rgba(138,137,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Join Beta Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}