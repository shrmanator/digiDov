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

interface ReceiptingAgreementStepProps {
  onAgree: () => void;
  charityName: string;
  onBack: () => void;
}

export function ReceiptingAgreementStep({
  onAgree,
  charityName,
  onBack,
}: ReceiptingAgreementStepProps) {
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
          <DialogTitle>Agreement</DialogTitle>
        </div>
        <DialogDescription>
          Please review the following terms.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="border rounded-lg">
          <div className="max-h-64 overflow-y-auto p-4 text-sm scrollbar-thin">
            <div className="flex items-start">
              <ScrollText className="h-5 w-5 text-primary mr-2" />
              <div>
                <p>
                  This Agreement (&ldquo;Agreement&rdquo;) is made between{" "}
                  <span className="bg-primary/10 px-1 rounded">
                    {charityName}
                  </span>{" "}
                  (&ldquo;the Charity&rdquo;) and{" "}
                  <span className="bg-primary/10 px-1 rounded">Digidov</span>{" "}
                  (&ldquo;the Platform Provider&rdquo;). The Charity agrees to
                  use the Platform Provider&apos;s services to facilitate the
                  secure issuance and management of donation receipts.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p>
                The Charity retains full legal responsibility for compliance
                with Canada Revenue Agency (CRA) guidelines and agrees to:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Maintain full and accurate records of all donations</li>
                <li>
                  Ensure that each donation qualifies as a gift under the Income
                  Tax Act
                </li>
                <li>Safeguard its CRA registration number</li>
              </ul>

              <p className="mt-4">
                The Platform Provider offers technical infrastructure to assist
                in donation receipting but does not assume liability for
                compliance. The Charity acknowledges that it remains the sole
                issuer of donation receipts and is responsible for ensuring
                their validity.
              </p>

              <p className="mt-2">
                The terms of this Agreement include strict adherence to CRA
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
            I have read and agree to the terms of this Third-Party Receipting
            Agreement.
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
