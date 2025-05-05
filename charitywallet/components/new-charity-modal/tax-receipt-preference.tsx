// app/(dashboard)/charity-setup/ReceiptPreferenceStep.tsx
"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export interface ReceiptPreferenceStepProps {
  /**
   * If true, the charity wants the CSV emailed to them (manual import).
   * If false, digiDov will email receipts directly to donors.
   */
  charity_sends_receipt: boolean;
  /** Called when the user toggles between modes */
  onChange: (value: boolean) => void;
  /** Proceed to the next step */
  onNext: () => void;
  /** Go back to the previous step */
  onBack: () => void;
}

export function ReceiptPreferenceStep({
  charity_sends_receipt,
  onChange,
  onNext,
  onBack,
}: ReceiptPreferenceStepProps) {
  /**
   * Handle switch toggle: checked represents "Email receipts to donors"
   * so we invert it to match charity_sends_receipt flag.
   */
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

      {/* Helper text beneath toggle */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {!charity_sends_receipt
            ? "We'll email tax receipts to donors on your behalf."
            : "We'll email you all donation data for easy CRM import."}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
