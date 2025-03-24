"use client";

import { CopyButton } from "@/components/copy-button";
import { Mail } from "lucide-react";

export default function DashboardFooter() {
  const email = "contact@digidov.com";
  const donorLink = "https://yourdonationpage.com/donate";

  return (
    <div className="fixed bottom-0 right-0 m-4 flex gap-2">
      {/* Email Copy Button */}
      <CopyButton
        text={email}
        label={email}
        leftIcon={<Mail className="mr-2 h-4 w-4" />}
        tooltip="Click to copy email"
      />
      {/* Donor Link Copy Button */}
      <CopyButton
        text={donorLink}
        label="Copy Donation Link"
        tooltip="Click to copy donation link"
      />
    </div>
  );
}
