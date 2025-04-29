"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

interface FeeAgreementStepProps {
  onAgree: () => void;
  onBack: () => void;
}

export function FeeAgreementStep({ onAgree, onBack }: FeeAgreementStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Fee Terms</DialogTitle>
        <DialogDescription>
          Please review the fee information below.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="border border-neutral-700 rounded-md p-4 text-sm flex gap-2 items-start">
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <p>
            DigiDov charges donors a 3% fee on each donation to cover
            operational costs and maintain service quality. By continuing, you
            confirm that you have read and agree to these terms.
          </p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onAgree}>
            Agree
          </Button>
        </div>
      </div>
    </>
  );
}
