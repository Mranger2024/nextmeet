import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// Initialize Cashfree SDK
const cashfree = {
  apiKey: process.env.CASHFREE_API_KEY || '',
  secretKey: process.env.CASHFREE_SECRET_KEY || '',
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
};

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Create a new subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + plan.duration_months * 30 * 24 * 60 * 60 * 1000
          ).toISOString()
        }
      ])
      .select()
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Create Cashfree payment order
    const orderData = {
      order_id: `order_${subscription.id}`,
      order_amount: plan.price,
      order_currency: plan.currency,
      customer_details: {
        customer_id: userId,
        customer_email: 'user@example.com', // Get from user profile
        customer_phone: '9999999999' // Get from user profile
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?order_id={order_id}&order_token={order_token}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`
      }
    };

    // Create payment order in Cashfree
    const response = await fetch(`${cashfree.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2022-09-01',
        'x-client-id': cashfree.apiKey,
        'x-client-secret': cashfree.secretKey
      },
      body: JSON.stringify(orderData)
    });

    const paymentOrder = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      );
    }

    // Save payment order details
    const { error: paymentOrderError } = await supabase
      .from('payment_orders')
      .insert([
        {
          user_id: userId,
          subscription_id: subscription.id,
          cashfree_order_id: paymentOrder.order_id,
          amount: plan.price,
          currency: plan.currency,
          status: 'created',
          payment_session_id: paymentOrder.payment_session_id
        }
      ]);

    if (paymentOrderError) {
      return NextResponse.json(
        { error: 'Failed to save payment order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: paymentOrder.order_id,
      payment_session_id: paymentOrder.payment_session_id,
      payment_url: paymentOrder.payment_link
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}