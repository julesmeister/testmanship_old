import { LicenseContent } from "@/components/policy-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "License Agreement | Testmanship",
  description: "Review our software license agreement to understand the terms of use for Testmanship's services.",
};

export default function LicensePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">License Agreement</h1>
      <LicenseContent />
    </div>
  );
}
