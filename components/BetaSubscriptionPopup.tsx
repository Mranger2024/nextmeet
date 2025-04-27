'use client';

import { useState } from 'react';
import BetaSubscriptionForm from './BetaSubscriptionForm';

interface BetaSubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
}

export default function BetaSubscriptionPopup({ isOpen, onClose, userId }: BetaSubscriptionPopupProps) {
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);

  if (!isOpen) return null;
  
  if (showSubscriptionForm) {
    return (
      <BetaSubscriptionForm 
        isOpen={true} 
        onClose={() => {
          setShowSubscriptionForm(false);
          onClose();
        }}
        userId={userId}
      />
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-left z-50 p-4">
      <div className="bg-gray-900 left-2 rounded-xl border border-[#845EFF] hover:shadow-[0_0_16px_rgba(138,137,255,0.3)]  w-full max-w-md p-6 relative z-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="bg-[#4F4FFF]/10 rounded-full p-2 mb-4">
            <div className="bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Premium Feature</h2>
          <p className="text-gray-300 mb-6">This feature is available exclusively to our beta subscribers.</p>
          
          <div className="bg-gray-800 rounded-xl p-4 w-full mb-6">
            <div className="text-center">
              <div className="bg-[#4F4FFF]/10 inline-block rounded-full px-3 py-1 text-xs font-medium text-blue-400 mb-2">Most Popular</div>
              <h3 className="text-xl font-bold text-white">Premium</h3>
              <p className="text-gray-400 text-sm mb-2">(Free Early Access)</p>
              <p className="text-3xl font-bold text-white mb-4">$2.49<span className="text-gray-400 text-sm font-normal">/mo</span></p>
              
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  HD video quality
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited matches
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced Features
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to sidebar
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlock All Features
                </li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={() => setShowSubscriptionForm(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] rounded-lg text-white font-medium transition-all hover:shadow-[0_0_16px_rgba(138,137,255,0.3)] shadow-[0_0_8px_rgba(138,137,255,0.2)]"
          >
            Join Beta
          </button>
        </div>
      </div>
    </div>
  );
}