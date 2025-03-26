"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isChecked) {
      onAgree();
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center">
          <DialogTitle>Fee Terms</DialogTitle>
        </div>
        <DialogDescription>Please review the following fee.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="border rounded-lg p-4 text-sm">
          <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="font-medium">Fee Details</p>
              <p className="mt-2">
                Digidov will receive a fee of 3% from each donation processed.
                This fee covers operational costs and ensures the quality of our
                services.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <Checkbox
            id="feeAgreeCheckbox"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
          />
          <label
            htmlFor="feeAgreeCheckbox"
            className="flex items-center ml-2 cursor-pointer text-sm"
          >
            I have read and agree to the fee terms.
          </label>
        </div>

        <div className="mt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!isChecked}>
            Next
          </Button>
        </div>
      </form>
    </>
  );
}
