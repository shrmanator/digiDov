// app/(dashboard)/charity-setup/ReceiptPreferenceStep.tsx
"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";

export interface ReceiptPreferenceStepProps {
  charity_sends_receipt: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ReceiptPreferenceStep({
  charity_sends_receipt,
  onChange,
  onNext,
  onBack,
}: ReceiptPreferenceStepProps) {
  const [touched, setTouched] = React.useState(false);

  const handleToggle = (checked: boolean) => {
    setTouched(true);
    // Switch is 'checked' when digiDov sends receipts, invert to match charity_sends_receipt
    onChange(!checked);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-lg font-medium">Tax Receipt Delivery</h2>
      <p className="text-sm text-muted-foreground">
        Would you like digiDov to automatically send tax receipts to your donors
        on your behalf?
      </p>

      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Manual Import</span>
        </div>
        <Switch
          checked={!charity_sends_receipt}
          onCheckedChange={handleToggle}
          aria-label="Toggle automatic receipt sending"
          className="mx-4"
        />
        <div className="flex items-center space-x-1">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Auto-Send</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {charity_sends_receipt
          ? "You’ll receive a CSV of donations to import into your CRM."
          : "Receipts will be emailed to donors automatically."}
      </p>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!touched}>
          Next
        </Button>
      </div>
    </div>
  );
}
