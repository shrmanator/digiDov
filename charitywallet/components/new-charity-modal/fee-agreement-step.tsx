"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Import the info icon from Lucide (or wherever you get your icons).
import { Info } from "lucide-react";

interface FeeAgreementStepProps {
  onAgree: () => void;
  onBack: () => void;
}

export function FeeAgreementStep({ onAgree, onBack }: FeeAgreementStepProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAgree();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Fee Terms</DialogTitle>
        <DialogDescription>
          Please review the fee information below.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="border border-neutral-700 rounded-md p-4 text-sm flex gap-2 items-start">
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <p>
            DigiDov will receive a 3% fee from each donation, covering
            operational costs and ensuring service quality. By continuing, you
            confirm that you have read and consent to these terms.
          </p>
        </div>

        <div className="mt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Agree</Button>
        </div>
      </form>
    </>
  );
}
