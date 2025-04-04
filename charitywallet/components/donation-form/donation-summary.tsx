import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface DonationSummaryProps {
  coverFee: boolean;
  onCoverFeeChange: () => void;
  selectedUSD: number | null;
  customUSD: string;
  charityReceives: number;
  feeAmount: number;
  tokenFloat: number;
  nativeSymbol: string;
  charityName: string;
}

export function DonationSummary({
  coverFee,
  onCoverFeeChange,
  selectedUSD,
  customUSD,
  charityReceives,
  feeAmount,
  tokenFloat,
  nativeSymbol,
  charityName,
}: DonationSummaryProps) {
  const donorAmount =
    selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
  const shortName =
    charityName.length > 20 ? `${charityName.slice(0, 20)}...` : charityName;

  return (
    <div className="p-3 bg-muted/50 rounded-md shadow-sm">
      <h4 className="text-sm font-semibold mb-2">Donation Summary</h4>
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          id="cover-fee"
          checked={coverFee}
          onCheckedChange={onCoverFeeChange}
        />
        <Label htmlFor="cover-fee" className="text-sm cursor-pointer">
          Cover 3% fee
        </Label>
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span>You pay:</span>
        <span>${donorAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Fee:</span>
        <span>
          {coverFee ? `$${feeAmount.toFixed(2)}` : `-$${feeAmount.toFixed(2)}`}
        </span>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between text-sm font-medium">
        <span>{shortName} receives:</span>
        <span>${charityReceives.toFixed(2)}</span>
      </div>
      <div className="text-right text-xs text-muted-foreground mt-1">
        ~{tokenFloat.toFixed(5)} {nativeSymbol}
      </div>
    </div>
  );
}
