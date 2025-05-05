// app/(dashboard)/charity-setup/ReceiptPreferenceStep.tsx
"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface ReceiptPreferenceStepProps {
  charity_sends_receipt: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ReceiptPreferenceStep({
  charity_sends_receipt,
  onChange,
  onNext,
  onBack,
  isLoading,
}: ReceiptPreferenceStepProps) {
  const handleToggle = (checked: boolean) => {
    onChange(!checked);
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-8">
      <h2 className="text-xl font-semibold text-center">
        Tax Receipt Delivery
      </h2>
      <p className="text-sm text-muted-foreground">
        Would you like us to send tax receipts on your behalf?
      </p>

      <div className="flex items-center justify-center space-x-4">
        <span className="font-medium">No</span>
        <Switch
          checked={!charity_sends_receipt}
          onCheckedChange={handleToggle}
          aria-label="Toggle receipt delivery mode"
        />
        <span className="font-medium">Yes</span>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {!charity_sends_receipt
            ? "We'll email tax receipts to donors on your behalf."
            : "We'll email you all donation data for easy CRM import."}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
        </Button>
      </div>
    </div>
  );
}
