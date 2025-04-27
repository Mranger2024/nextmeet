import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Verify Cashfree webhook signature
function verifyWebhookSignature(payload: string, signature: string) {
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const orderId = event.order_id;
    const orderStatus = event.order_status.toLowerCase();

    // Get payment order details
    const { data: paymentOrder, error: paymentOrderError } = await supabase
      .from('payment_orders')
      .select('*, subscriptions(*)')
      .eq('cashfree_order_id', orderId)
      .single();

    if (paymentOrderError || !paymentOrder) {
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      );
    }

    // Update payment order status
    const { error: updatePaymentError } = await supabase
      .from('payment_orders')
      .update({
        status: orderStatus,
        payment_details: event
      })
      .eq('cashfree_order_id', orderId);

    if (updatePaymentError) {
      return NextResponse.json(
        { error: 'Failed to update payment order' },
        { status: 500 }
      );
    }

    // Update subscription status based on payment status
    if (orderStatus === 'paid') {
      const { error: updateSubscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          cashfree_subscription_id: event.cf_subscription_id || null
        })
        .eq('id', paymentOrder.subscription_id);

      if (updateSubscriptionError) {
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    } else if (['failed', 'expired'].includes(orderStatus)) {
      const { error: updateSubscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: 'expired'
        })
        .eq('id', paymentOrder.subscription_id);

      if (updateSubscriptionError) {
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}