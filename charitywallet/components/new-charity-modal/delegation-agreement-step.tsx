"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollText } from "lucide-react";

interface DelegationAgreementStepProps {
  onAgree: () => void;
  charityName: string;
  onBack: () => void;
}

export function DelegationAgreementStep({
  onAgree,
  charityName,
  onBack,
}: DelegationAgreementStepProps) {
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
          <DialogTitle>Delegation Agreement</DialogTitle>
        </div>
        <DialogDescription>
          Please review the agreement carefully before proceeding.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="border rounded-lg">
          <div className="max-h-64 overflow-y-auto p-4 text-sm scrollbar-thin">
            <div className="flex items-start">
              <ScrollText className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium">Agreement Terms</p>
                <p>
                  This Delegation Agreement (&ldquo;Agreement&rdquo;) is made
                  between{" "}
                  <span className="bg-primary/10 px-1 rounded">
                    {charityName}
                  </span>{" "}
                  (&ldquo;the Charity&rdquo;) and{" "}
                  <span className="bg-primary/10 px-1 rounded">Digidov</span>{" "}
                  (&ldquo;the Delegate&rdquo;). The Charity hereby delegates
                  authority to the Delegate to issue official donation receipts
                  on its behalf.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p>
                The Delegate agrees to comply with all Canada Revenue Agency
                guidelines, including:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Maintaining full and accurate records</li>
                <li>
                  Ensuring that each donation qualifies as a gift under the
                  Income Tax Act
                </li>
                <li>Safeguarding the Charity&apos;s registration number</li>
              </ul>

              <p className="mt-4">
                Additionally, the Delegate acknowledges that Digidov will retain
                a fee of 3% from each donation processed under this Agreement.
              </p>

              <p className="mt-4">
                The Delegate acknowledges that the Charity retains ultimate
                responsibility for all receipts issued, and that any breach of
                this Agreement may result in legal or financial consequences.
              </p>

              <p className="mt-2">
                The terms of this Agreement include strict adherence to the CRA
                receipting requirements, maintaining secure records, and
                providing a verifiable audit trail.
              </p>

              <p className="font-medium mt-2">
                This Agreement shall be governed by and construed in accordance
                with the laws of Canada.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <Checkbox
            id="agreeCheckbox"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
          />
          <label
            htmlFor="agreeCheckbox"
            className="flex items-center ml-2 cursor-pointer text-sm"
          >
            I have read and agree to the terms of this Delegation Agreement.
          </label>
        </div>

        <div className="mt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!isChecked}>
            Continue
          </Button>
        </div>
      </form>
    </>
  );
}
