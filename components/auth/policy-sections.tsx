import React from 'react';

interface PolicySectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function PolicySection({ id, title, children }: PolicySectionProps) {
  return (
    <div id={id} className="min-h-screen w-full flex items-center justify-center snap-start shrink-0">
      <div className="max-w-4xl px-8">
        <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PolicySections() {
  return (
    <div className="flex flex-col w-full snap-y snap-mandatory">
      <PolicySection id="terms" title="Terms & Conditions">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h3>
            <p className="text-gray-200">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Use License</h3>
            <p className="text-gray-200">Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">3. Disclaimer</h3>
            <p className="text-gray-200">The materials on Testmanship's website are provided on an 'as is' basis. Testmanship makes no warranties, expressed or implied.</p>
          </section>
        </div>
      </PolicySection>
      
      <PolicySection id="privacy" title="Privacy Policy">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Information We Collect</h3>
            <p className="text-gray-200">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc ml-6 mt-2 text-gray-200">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Communication history</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. How We Use Your Information</h3>
            <p className="text-gray-200">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 text-gray-200">
              <li>Provide and maintain our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices</li>
            </ul>
          </section>
        </div>
      </PolicySection>
      
      <PolicySection id="license" title="License Agreement">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Grant of License</h3>
            <p className="text-gray-200">Subject to the terms of this Agreement, Testmanship grants you a limited, non-exclusive, non-transferable license to use the software.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Scope of License</h3>
            <p className="text-gray-200">This license grants you the right to:</p>
            <ul className="list-disc ml-6 mt-2 text-gray-200">
              <li>Install and use the software</li>
              <li>Make one backup copy</li>
              <li>Receive updates and patches</li>
            </ul>
          </section>
        </div>
      </PolicySection>
      
      <PolicySection id="refund" title="Refund Policy">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Refund Eligibility</h3>
            <p className="text-gray-200">We offer refunds under the following conditions:</p>
            <ul className="list-disc ml-6 mt-2 text-gray-200">
              <li>Request made within 30 days of purchase</li>
              <li>Technical issues preventing proper usage</li>
              <li>Service does not match advertised features</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Refund Process</h3>
            <p className="text-gray-200">To request a refund:</p>
            <ol className="list-decimal ml-6 mt-2 text-gray-200">
              <li>Contact our support team</li>
              <li>Provide order number and reason</li>
              <li>Allow 5-7 business days for review</li>
            </ol>
          </section>
        </div>
      </PolicySection>
    </div>
  );
}
