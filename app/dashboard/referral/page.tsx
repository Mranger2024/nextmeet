'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingReferrals: 0
  });

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch user's referral code
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('referral_code')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        if (userData?.referral_code) {
          setReferralCode(userData.referral_code);
        }

        // Fetch referral statistics
        const { data: referrals, error: referralsError } = await supabase
          .from('referrals')
          .select('status')
          .eq('referrer_id', session.user.id);

        if (referralsError) throw referralsError;

        const stats = {
          totalReferrals: referrals?.length || 0,
          successfulReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
          pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0
        };

        setReferralStats(stats);
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };

    fetchReferralData();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Referral Program</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Referral Code</h2>
        <div className="flex items-center space-x-4">
          <code className="bg-gray-100 px-4 py-2 rounded">{referralCode || 'Loading...'}</code>
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold text-blue-500">{referralStats.totalReferrals}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Successful Referrals</h3>
          <p className="text-3xl font-bold text-green-500">{referralStats.successfulReferrals}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Referrals</h3>
          <p className="text-3xl font-bold text-yellow-500">{referralStats.pendingReferrals}</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Share your referral code with friends</li>
          <li>When they sign up using your code, they get a special discount</li>
          <li>Once they make their first purchase, you&apos;ll earn rewards</li>
          <li>Track your referrals and rewards in this dashboard</li>
        </ol>
      </div>
    </div>
  );
}