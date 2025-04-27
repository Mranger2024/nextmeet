'use client'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141522] via-[#0F1117] to-[#080A0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4F4FFF] via-[#845EFF] to-[#A455FF] text-transparent bg-clip-text mb-8 text-center">
          Community Rules & Guidelines
        </h1>

        <div className="space-y-8 bg-[#1A1C24] p-8 rounded-lg shadow-lg text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">General Conduct</h2>
            <p className="mb-4">All members of our community must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Treat all users with respect and courtesy</li>
              <li>Maintain appropriate and professional behavior</li>
              <li>Use appropriate language and content</li>
              <li>Respect other&apos;s privacy and personal boundaries</li>
              <li>Follow all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Communication Guidelines</h2>
            <p className="mb-4">When using chat, video, or messaging features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No harassment, bullying, or intimidation</li>
              <li>No hate speech or discriminatory content</li>
              <li>No spamming or excessive self-promotion</li>
              <li>No sharing of explicit or adult content</li>
              <li>Respect other&apos;s time zones and availability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Content Guidelines</h2>
            <p className="mb-4">All content shared must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be appropriate for a professional environment</li>
              <li>Respect intellectual property rights</li>
              <li>Not contain malicious software or links</li>
              <li>Not include personal or sensitive information</li>
              <li>Be relevant to the platform&apos;s purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Privacy and Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not share personal information of others</li>
              <li>Do not attempt to bypass security measures</li>
              <li>Report any security vulnerabilities</li>
              <li>Use secure and private internet connections</li>
              <li>Enable two-factor authentication when available</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Video Chat Etiquette</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure appropriate background and attire</li>
              <li>Use headphones to prevent audio feedback</li>
              <li>Mute when not speaking in group calls</li>
              <li>Do not record sessions without consent</li>
              <li>Be punctual for scheduled meetings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Reporting Violations</h2>
            <p className="mb-4">If you witness rule violations:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Use the in-app reporting feature</li>
              <li>Provide specific details of the violation</li>
              <li>Include relevant screenshots or evidence</li>
              <li>Do not engage with the violator</li>
              <li>Wait for moderator intervention</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Consequences</h2>
            <p className="mb-4">Rule violations may result in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Temporary feature restrictions</li>
              <li>Account suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action in severe cases</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Updates to Rules</h2>
            <p>
              These rules may be updated periodically to maintain a safe and positive environment. Users will be notified of significant changes through the platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}