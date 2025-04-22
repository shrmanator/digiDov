import React from "react";
import { Button }    from "@/components/ui/button";
import { Label }     from "@/components/ui/label";
import { Input }     from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge }     from "@/components/ui/badge";

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
        <Label className="mb-2 block text-sm font-medium">
          Choose an amount
        </Label>
        <div className="grid gap-2">
          {presetAmounts.map((usdVal) => {
            const isSelected = selectedAmount === usdVal;
            const approxTokens = (usdVal / tokenPrice).toFixed(3);
            return (
              <Button
                key={usdVal}
                variant={isSelected ? "default" : "outline"}
                onClick={() => onPresetClick(usdVal)}
                className="w-full justify-between py-6"
              >
                <span className="text-base font-medium">${usdVal}</span>
                <Badge variant="secondary" className="font-normal">
                  ~{approxTokens} {nativeSymbol}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center my-1">
        <Separator className="flex-1" />
        <span className="mx-3 text-xs font-medium text-muted-foreground px-2">
          OR
        </span>
        <Separator className="flex-1" />
      </div>

      <div>
        <Label htmlFor="custom-usd" className="mb-2 block text-sm font-medium">
          Enter your own
        </Label>
        <div className="relative">
          <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
            <span className="text-sm font-medium text-muted-foreground">
              $
            </span>
          </div>
          <Input
            id="custom-usd"
            type="number"
            placeholder="e.g. 100"
            value={customAmount}
            onChange={onCustomChange}
            className="pl-6 h-10"
          />
        </div>
        {tokenFloat > 0 && selectedAmount === null && (
          <p className="mt-1 text-xs text-muted-foreground">
            ~{tokenFloat.toFixed(3)} {nativeSymbol}
          </p>
        )}
      </div>
    </div>
  );
}
