'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  payment_method: string;
  payment_details: string;
  notes: string | null;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        setUserId(session.user.id);
        await fetchWithdrawals(session.user.id);
        await fetchBalance(session.user.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const fetchWithdrawals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };
  
  const fetchBalance = async (userId: string) => {
    try {
      // Fetch user's earnings from referrals
      const { data: referralEarnings, error: referralError } = await supabase
        .from('referrals')
        .select('commission_amount')
        .eq('referrer_id', userId)
        .eq('status', 'converted');
        
      if (referralError) throw referralError;
      
      // Calculate total earnings
      const totalEarnings = referralEarnings?.reduce((sum, item) => sum + (item.commission_amount || 0), 0) || 0;
      
      // Fetch total withdrawn amount
      const { data: withdrawnAmounts, error: withdrawnError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('user_id', userId)
        .in('status', ['completed', 'pending']);
        
      if (withdrawnError) throw withdrawnError;
      
      // Calculate total withdrawn
      const totalWithdrawn = withdrawnAmounts?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      
      // Calculate available balance
      const available = totalEarnings - totalWithdrawn;
      setAvailableBalance(available > 0 ? available : 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!userId) {
        setError('You must be logged in to request a withdrawal');
        return;
      }
      
      const amount = parseFloat(withdrawalAmount);
      
      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid withdrawal amount');
        return;
      }
      
      if (amount > availableBalance) {
        setError('Withdrawal amount exceeds your available balance');
        return;
      }
      
      if (amount < 10) {
        setError('Minimum withdrawal amount is $10');
        return;
      }
      
      // Validate payment details
      if (!paymentDetails.trim()) {
        setError('Please enter your payment details');
        return;
      }
      
      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([
          {
            user_id: userId,
            amount,
            status: 'pending',
            payment_method: paymentMethod,
            payment_details: paymentDetails
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Reset form and show success message
      setWithdrawalAmount('');
      setPaymentDetails('');
      setSuccess('Withdrawal request submitted successfully!');
      
      // Refresh withdrawals list and balance
      await fetchWithdrawals(userId);
      await fetchBalance(userId);
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      setError('Failed to submit withdrawal request. Please try again.');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Withdrawals</h1>
      
      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Available Balance</h2>
            <p className="text-3xl font-bold text-green-600">${availableBalance.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>
      
      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Request Withdrawal</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}
        
        <form onSubmit={handleWithdrawalSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              min="10"
              step="0.01"
              max={availableBalance}
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Minimum withdrawal: $10.00</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Details
            </label>
            <textarea
              id="paymentDetails"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={paymentMethod === 'paypal' ? 'Enter your PayPal email' : 
                          paymentMethod === 'bank_transfer' ? 'Enter your bank account details' : 
                          'Enter your wallet address'}
              rows={3}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={availableBalance <= 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Withdrawal
          </button>
          
          {availableBalance <= 0 && (
            <p className="mt-2 text-sm text-red-600">You don't have enough balance to withdraw</p>
          )}
        </form>
      </div>
      
      {/* Withdrawal History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${withdrawal.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {withdrawal.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(withdrawal.status)}
                      {withdrawal.notes && (
                        <p className="text-xs text-gray-500 mt-1">{withdrawal.notes}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            You haven't made any withdrawal requests yet.
          </div>
        )}
      </div>
    </div>
  );
}