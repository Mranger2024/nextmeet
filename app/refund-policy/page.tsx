'use client'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141522] via-[#0F1117] to-[#080A0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text mb-8 text-center">
          Refund Policy
        </h1>

        <div className="space-y-8 bg-[#1A1C24] p-8 rounded-lg shadow-lg text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Refund Eligibility</h2>
            <p className="mb-4">We offer refunds under the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Technical issues preventing service access</li>
              <li>Billing errors or unauthorized charges</li>
              <li>Service cancellation within 14 days of subscription start</li>
              <li>Significant service disruptions or downtime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Refund Process</h2>
            <p className="mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team through the contact form</li>
              <li>Provide your account details and reason for refund</li>
              <li>Include any relevant documentation or screenshots</li>
              <li>Allow up to 5-7 business days for review</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Non-Refundable Items</h2>
            <p className="mb-4">The following are not eligible for refunds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Virtual goods or credits already used</li>
              <li>Subscriptions active for more than 14 days</li>
              <li>Account terminations due to policy violations</li>
              <li>Premium features already utilized</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Refund Timeframes</h2>
            <p>
              Once approved, refunds will be processed within 5-10 business days. The time to receive the refund depends on your payment method:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Credit/Debit Cards: 3-5 business days</li>
              <li>PayPal: 1-2 business days</li>
              <li>Bank Transfers: 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions about our refund policy or need to request a refund, please contact our support team through our contact form or email us at support@example.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}