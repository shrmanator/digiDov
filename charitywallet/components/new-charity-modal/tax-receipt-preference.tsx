"use client";
import React from "react";
import { Switch } from "@/components/ui/switch"; // UI switch or similar component

interface Props {
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
}: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Receipt Preferences</h2>
      <p className="text-sm text-gray-500">
        You can change this later under Settings → Receipt Preferences.
      </p>
      <div className="flex items-center space-x-3">
        <Switch checked={charity_sends_receipt} onCheckedChange={onChange} />
        <span>
          {charity_sends_receipt
            ? "Our organization will send receipts manually"
            : "digiDov will generate and send the tax receipt"}
        </span>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
