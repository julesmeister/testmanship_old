import { RefundContent } from "@/components/policy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Testmanship",
  description: "Understand our refund policy and process for Testmanship's services.",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <RefundContent />
    </div>
  );
}
