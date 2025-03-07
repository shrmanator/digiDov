import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface AmountSelectorProps {
  presetAmounts: number[];
  selectedAmount: number | null;
  customAmount: string;
  onPresetClick: (amount: number) => void;
  onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tokenPrice: number;
  nativeSymbol: string;
  tokenFloat: number;
}

export function AmountSelector({
  presetAmounts,
  selectedAmount,
  customAmount,
  onPresetClick,
  onCustomChange,
  tokenPrice,
  nativeSymbol,
  tokenFloat,
}: AmountSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-2 block text-sm font-semibold">
          Choose an amount (CAD)
        </Label>
        <div className="space-y-2">
          {presetAmounts.map((usdVal) => {
            const isSelected = selectedAmount === usdVal;
            const approxTokens = (usdVal / tokenPrice).toFixed(3);
            return (
              <Button
                key={usdVal}
                variant={isSelected ? "default" : "outline"}
                onClick={() => onPresetClick(usdVal)}
                className="w-full justify-between h-10"
              >
                <span>${usdVal}</span>
                <span className="text-xs">
                  (~{approxTokens} {nativeSymbol})
                </span>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="mx-2 text-sm font-medium text-muted-foreground">
          OR
        </span>
        <Separator className="flex-1" />
      </div>
      <div>
        <Label
          htmlFor="custom-usd"
          className="mb-1 block text-sm font-semibold"
        >
          Enter your own (CAD)
        </Label>
        <div className="relative group">
          <span className="absolute left-2 inset-y-0 flex items-center pointer-events-none text-sm font-semibold text-muted-foreground group-focus-within:text-card-foreground">
            $
          </span>
          <Input
            id="custom-usd"
            type="number"
            placeholder="e.g. 100"
            value={customAmount}
            onChange={onCustomChange}
            className="h-10 pl-6"
          />
        </div>
        {tokenFloat > 0 && selectedAmount === null && (
          <p className="text-sm text-muted-foreground">
            ~{tokenFloat.toFixed(3)} {nativeSymbol}
          </p>
        )}
      </div>
    </div>
  );
}
