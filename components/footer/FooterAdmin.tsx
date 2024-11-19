'use client';

/*eslint-disable*/

import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import PolicyModal from './PolicyModal';

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<{
    title: string;
    content: React.ReactNode;
  } | null>(null);

  const openPolicy = (title: string, content: React.ReactNode) => {
    setActivePolicy({ title, content });
  };

  const closePolicy = () => {
    setActivePolicy(null);
  };

  return (
    <>
      <div className="w-full mt-auto footer-admin">
        <div className="flex w-full flex-col items-center justify-between px-1 py-4 lg:px-8 xl:flex-row">
          <p className="mb-4 text-center text-sm text-gray-600 sm:!mb-0">
            {new Date().getFullYear()} Testmanship. All Rights Reserved.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => openPolicy("Terms & Conditions", (
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
              ))}
              className="text-sm text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
            >
              Terms & Conditions
            </button>
            <span className="hidden sm:block">|</span>
            <button
              onClick={() => openPolicy("Privacy Policy", (
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
              ))}
              className="text-sm text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:block">|</span>
            <button
              onClick={() => openPolicy("License Agreement", (
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
              ))}
              className="text-sm text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
            >
              License Agreement
            </button>
            <span className="hidden sm:block">|</span>
            <button
              onClick={() => openPolicy("Refund Policy", (
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
              ))}
              className="text-sm text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
            >
              Refund Policy
            </button>
          </div>
        </div>

        {activePolicy && (
          <PolicyModal
            isOpen={true}
            onClose={closePolicy}
            title={activePolicy.title}
          >
            {activePolicy.content}
          </PolicyModal>
        )}
      </div>
    </>
  );
}
