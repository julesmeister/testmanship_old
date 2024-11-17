import React from 'react';

interface PolicySectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function PolicySection({ id, title, children }: PolicySectionProps) {
  // Define gradient classes based on section ID
  const gradientClasses = {
    terms: "from-emerald-400 via-emerald-600 to-teal-900",
    privacy: "from-purple-400 via-purple-600 to-indigo-900",
    license: "from-rose-400 via-rose-600 to-pink-900",
    refund: "from-amber-400 via-amber-600 to-orange-900"
  };

  return (
    <div id={id} className="relative min-h-screen w-full flex items-center justify-center snap-start shrink-0 overflow-hidden">
      {/* Background gradient and decorative elements */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[id as keyof typeof gradientClasses]}`}>
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          {/* Large circle */}
          <div className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
          {/* Small circle */}
          <div className="absolute top-[60%] -left-[10%] h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />
          {/* Additional shapes */}
          <div className="absolute top-[20%] right-[20%] h-24 w-24 rotate-45 transform bg-white/5 backdrop-blur-lg" />
          <div className="absolute bottom-[30%] left-[10%] h-16 w-16 rotate-12 transform bg-white/5 backdrop-blur-lg rounded-lg" />
          {/* Floating dots */}
          <div className="absolute top-[15%] left-[25%] h-2 w-2 rounded-full bg-white/30" />
          <div className="absolute top-[45%] right-[15%] h-3 w-3 rounded-full bg-white/20" />
          <div className="absolute bottom-[25%] right-[35%] h-2 w-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl px-8">
        <div className="rounded-xl bg-white/10 backdrop-blur-md p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
          <div className="text-white/90">
            {children}
          </div>
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
            <p className="text-white/80">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Use License</h3>
            <p className="text-white/80">Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">3. Disclaimer</h3>
            <p className="text-white/80">The materials on Testmanship's website are provided on an 'as is' basis. Testmanship makes no warranties, expressed or implied.</p>
          </section>
        </div>
      </PolicySection>
      
      <PolicySection id="privacy" title="Privacy Policy">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Information We Collect</h3>
            <p className="text-white/80">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc ml-6 mt-2 text-white/80">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Communication history</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. How We Use Your Information</h3>
            <p className="text-white/80">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mt-2 text-white/80">
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
            <p className="text-white/80">Subject to the terms of this Agreement, Testmanship grants you a limited, non-exclusive, non-transferable license to use the software.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Scope of License</h3>
            <p className="text-white/80">This license grants you the right to:</p>
            <ul className="list-disc ml-6 mt-2 text-white/80">
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
            <p className="text-white/80">We offer refunds under the following conditions:</p>
            <ul className="list-disc ml-6 mt-2 text-white/80">
              <li>Request made within 30 days of purchase</li>
              <li>Technical issues preventing proper usage</li>
              <li>Service does not match advertised features</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Refund Process</h3>
            <p className="text-white/80">To request a refund, please contact our support team with your order details and reason for the refund.</p>
          </section>
        </div>
      </PolicySection>
    </div>
  );
}
