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

  const shortenedCharityName =
    charityName.length > 20 ? `${charityName.slice(0, 20)}...` : charityName;

  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-md">
      <h4 className="font-medium mb-2">Donation Summary</h4>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="cover-fee"
            checked={coverFee}
            onCheckedChange={onCoverFeeChange}
          />
          <Label
            htmlFor="cover-fee"
            className="text-sm font-medium cursor-pointer"
          >
            Cover the 3% platform fee
          </Label>
        </div>

        <div className="flex justify-between">
          <span>You pay:</span>
          <span>${donorAmount.toFixed(2)} CAD</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Processing fee (3%):</span>
          <span>
            {coverFee ? "" : "-"}${feeAmount.toFixed(2)} CAD
          </span>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between font-medium">
          <span>{shortenedCharityName} receives:</span>
          <span>${charityReceives.toFixed(2)} CAD</span>
        </div>

        <div className="text-xs text-muted-foreground text-right mt-1">
          ~{tokenFloat.toFixed(5)} {nativeSymbol} sent to charity
        </div>
      </div>
    </div>
  );
}
