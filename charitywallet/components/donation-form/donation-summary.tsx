import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface InlineSummaryProps {
  totalPaid: number;
  charityReceives: number;
  tokenFloat: number;
  nativeSymbol: string;
  coverFee: boolean;
  feeAmount: number;
  onToggleCoverFee: () => void;
}

export const InlineSummary: React.FC<InlineSummaryProps> = ({
  totalPaid,
  charityReceives,
  tokenFloat,
  nativeSymbol,
  coverFee,
  feeAmount,
  onToggleCoverFee,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          id="cover-fee"
          checked={coverFee}
          onCheckedChange={onToggleCoverFee}
        />
        <Label htmlFor="cover-fee" className="text-sm cursor-pointer">
          Cover 3% fee ({coverFee ? "+" : "-"}${feeAmount.toFixed(2)})
        </Label>
      </div>

      <p className="text-center text-sm mt-3">
        Donate ${totalPaid.toFixed(2)} USD{" "}
        <span className="text-muted-foreground">
          (Charity gets ${charityReceives.toFixed(2)}) • ~
          {tokenFloat.toFixed(3)} {nativeSymbol}
        </span>
      </p>
    </div>
  );
};
