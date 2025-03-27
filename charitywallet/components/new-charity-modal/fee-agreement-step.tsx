"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";

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
        <div className="flex items-center">
          <DialogTitle>Fee Terms</DialogTitle>
        </div>
        <DialogDescription>
          Please review the following fee details.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="border rounded-lg p-4 text-sm">
          <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="font-medium">Fee Details</p>
              <p className="mt-2">
                DigiDov will receive a fee of 3% from each donation processed.
                This fee covers operational costs and ensures the quality of our
                services.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm mt-4">
          By clicking “Agree,” you confirm that you have read and consent to the
          fee terms.
        </p>

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
