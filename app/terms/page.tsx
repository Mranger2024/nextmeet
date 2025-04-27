'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141522] via-[#0F1117] to-[#080A0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text mb-8 text-center">
          Terms & Conditions
        </h1>

        <div className="space-y-8 bg-[#1A1C24] p-8 rounded-lg shadow-lg text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
            <p>
              By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to use this service</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not use another user&apos;s account without permission</li>
              <li>You must notify us immediately of any security breach</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">User Content</h2>
            <p className="mb-4">By posting content on our platform, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the right to post the content</li>
              <li>Content does not violate any intellectual property rights</li>
              <li>Content is not illegal, harmful, or offensive</li>
              <li>We may remove content that violates our policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Activities</h2>
            <p className="mb-4">Users are prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harassing or bullying other users</li>
              <li>Posting inappropriate or offensive content</li>
              <li>Attempting to hack or disrupt the service</li>
              <li>Using the platform for illegal activities</li>
              <li>Creating multiple accounts for deceptive purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Subscription Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed in advance on a recurring basis</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are subject to our Refund Policy</li>
              <li>We reserve the right to modify pricing with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
            <p>
              The platform, including its original content, features, and functionality, is owned by us and protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any changes by updating the date at the top of these terms and providing notice through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have any questions about these Terms & Conditions, please contact us through our contact form or at legal@example.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}