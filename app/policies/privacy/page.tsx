import { PrivacyContent } from "@/components/policy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Testmanship",
  description: "Learn how Testmanship collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <PrivacyContent />
    </div>
  );
}
