import { TermsContent } from "@/components/policy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Testmanship",
  description: "Read our terms and conditions to understand your rights and responsibilities when using Testmanship's services.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <TermsContent />
    </div>
  );
}
