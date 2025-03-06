"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DelegationAgreementStepProps {
  onAgree: () => void;
}

export function DelegationAgreementStep({
  onAgree,
}: DelegationAgreementStepProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isChecked) {
      onAgree();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Delegation Agreement</h2>
      <div className="overflow-y-auto max-h-80 p-2 border rounded">
        <p>
          This Delegation Agreement ("Agreement") is made between [Charity Name]
          ("the Charity") and [Delegate Name] ("the Delegate"). The Charity
          hereby delegates authority to the Delegate to issue official donation
          receipts on its behalf. The Delegate agrees to comply with all Canada
          Revenue Agency guidelines, including maintaining full records,
          ensuring that each donation qualifies as a gift under the Income Tax
          Act, and safeguarding the Charity's registration number. The Delegate
          acknowledges that the Charity retains ultimate responsibility for all
          receipts issued, and that any breach of this Agreement may result in
          legal or financial consequences. The terms of this Agreement include,
          but are not limited to, strict adherence to the CRA receipting
          requirements, maintaining secure and accurate records, and providing a
          verifiable audit trail. This Agreement shall be governed by and
          construed in accordance with the laws of Canada.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreeCheckbox"
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(checked as boolean)}
        />
        <label htmlFor="agreeCheckbox" className="cursor-pointer">
          I have read and agree to the terms of this Delegation Agreement.
        </label>
      </div>
      <Button type="submit" disabled={!isChecked}>
        Continue
      </Button>
    </form>
  );
}
