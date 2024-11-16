import React from 'react'

export function TermsContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Testmanship's website for personal, non-commercial transitory viewing only.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Disclaimer</h2>
        <p>The materials on Testmanship's website are provided on an 'as is' basis. Testmanship makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Limitations</h2>
        <p>In no event shall Testmanship or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Testmanship's website.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Revisions and Errata</h2>
        <p>The materials appearing on Testmanship's website could include technical, typographical, or photographic errors. Testmanship does not warrant that any of the materials on its website are accurate, complete or current.</p>
      </section>
    </div>
  )
}

export function PrivacyContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including when you create an account, make a purchase, or contact us for support. This may include:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Name and contact information</li>
          <li>Account credentials</li>
          <li>Payment information</li>
          <li>Communication history</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Provide and maintain our services</li>
          <li>Process your transactions</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
        </ul>
      </section>
    </div>
  )
}

export function LicenseContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Grant of License</h2>
        <p>Subject to the terms of this Agreement, Testmanship grants you a limited, non-exclusive, non-transferable license to use the software for your personal or business purposes.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Scope of License</h2>
        <div className="space-y-2">
          <p>This license grants you the right to:</p>
          <ul className="list-disc ml-6">
            <li>Install and use the software on authorized devices</li>
            <li>Make one copy of the software for backup purposes</li>
            <li>Receive updates and patches as they become available</li>
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Restrictions</h2>
        <p>You may not:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Modify, reverse engineer, or decompile the software</li>
          <li>Create derivative works based on the software</li>
          <li>Remove any proprietary notices from the software</li>
          <li>Use the software in violation of applicable laws</li>
        </ul>
      </section>
    </div>
  )
}

export function RefundContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Refund Eligibility</h2>
        <p>We offer refunds under the following conditions:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Request made within 30 days of purchase</li>
          <li>Product/service has not been extensively used</li>
          <li>Technical issues preventing proper usage</li>
          <li>Service does not match advertised features</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Refund Process</h2>
        <p>To request a refund:</p>
        <ol className="list-decimal ml-6 mt-2">
          <li>Contact our support team</li>
          <li>Provide your order number and reason for refund</li>
          <li>Allow up to 5-7 business days for review</li>
          <li>Receive confirmation of refund decision</li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Refund Method</h2>
        <p>Refunds will be processed using the original payment method:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Credit/debit card refunds: 5-10 business days</li>
          <li>Bank transfers: 3-5 business days</li>
          <li>Digital wallets: 1-3 business days</li>
        </ul>
      </section>
    </div>
  )
}
