import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DonationSummaryProps {
  coverFee: boolean;
  feeAmount: number;
  onToggleCoverFee: () => void;
}

/**
 * A simple fee coverage toggle for donations.
 */
export const DonationSummary: React.FC<DonationSummaryProps> = ({
  coverFee,
  feeAmount,
  onToggleCoverFee,
}) => {
  return (
    <div className="mt-4 w-full flex items-center space-x-2">
      <Checkbox
        id="cover-fee"
        checked={coverFee}
        onCheckedChange={onToggleCoverFee}
      />
      <Label htmlFor="cover-fee" className="text-sm font-medium cursor-pointer">
        Cover 3% processing fee{coverFee && ` (+$${feeAmount.toFixed(2)})`}
      </Label>
    </div>
  );
};
