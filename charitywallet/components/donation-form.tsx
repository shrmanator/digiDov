"use client";

import { useState } from "react";
import Web3 from "web3";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useActiveWalletChain } from "thirdweb/react";
import { usePriceWebSocket } from "@/hooks/use-crypto-to-usd";
import { useSendWithFee } from "./send-with-fee";
import { charity } from "@prisma/client";

interface DonationFormProps {
  charity: charity;
}

export default function DonationForm({ charity }: DonationFormProps) {
  // Predefined USD choices
  const presetUsdAmounts = [10, 20, 50];

  // State to track which preset is selected or a custom input
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");

  // Web3 + chain info
  const web3 = new Web3();
  const activeChain = useActiveWalletChain();
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  // Live price in USD for the native token
  const tokenPriceUSD = usePriceWebSocket(nativeSymbol);

  // Determine how many tokens to send, in smallest units (wei, etc.)
  const donationAmountWei = (() => {
    if (!tokenPriceUSD) return null;

    // The user’s chosen USD
    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
    if (usdValue <= 0) return null;

    // Convert USD -> token amount
    const tokenAmount = usdValue / tokenPriceUSD;

    // Convert token amount -> smallest units
    return decimals === 18
      ? BigInt(web3.utils.toWei(tokenAmount.toString(), "ether"))
      : BigInt(Math.floor(tokenAmount * 10 ** decimals));
  })();

  // Approx token amount *in float form* (for the button label)
  const tokenFloat = (() => {
    if (!tokenPriceUSD) return 0;
    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
    if (usdValue <= 0) return 0;
    return usdValue / tokenPriceUSD;
  })();

  // The main donation hook
  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

  // Button label logic
  const chosenUSD =
    selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
  const buttonLabel = isPending
    ? "Processing..."
    : transactionResult
    ? "Donation Sent!"
    : tokenFloat > 0
    ? `Donate $${chosenUSD.toFixed(2)} (${tokenFloat.toFixed(
        3
      )} ${nativeSymbol})`
    : "Donate";

  // Handlers
  const handlePresetClick = (usdVal: number) => {
    setSelectedUSD(usdVal);
    setCustomUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUSD(e.target.value);
    setSelectedUSD(null);
  };

  return (
    <Card className="mx-auto w-full max-w-xl border bg-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Donate to {charity.charity_name}
        </CardTitle>
        <CardDescription className="mt-1">
          Amount will be sent in {nativeSymbol}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-4">
        {/* Show skeletons while token price is loading */}
        {!tokenPriceUSD ? (
          <div className="grid items-start gap-8 sm:grid-cols-[1fr_auto_1fr]">
            {/* Left side: label + 3 button skeletons */}
            <div>
              <Skeleton className="mb-2 h-5 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>

            {/* Middle: vertical separator + “OR” */}
            <div className="hidden h-full flex-col items-center sm:flex">
              <Separator orientation="vertical" className="flex-1" />
              <span className="my-2 text-sm font-medium text-muted-foreground">
                OR
              </span>
              <Separator orientation="vertical" className="flex-1" />
            </div>

            {/* Right side: label + input skeleton */}
            <div>
              <Skeleton className="mb-2 h-5 w-1/2" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-8 sm:grid-cols-[1fr_auto_1fr]">
            {/* Left: Preset Amounts */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Choose an amount
              </Label>
              <div className="space-y-2">
                {presetUsdAmounts.map((usdVal) => {
                  const isSelected = selectedUSD === usdVal;
                  // Approx token conversion
                  const approxTokens = (usdVal / tokenPriceUSD).toFixed(3);
                  return (
                    <Button
                      key={usdVal}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handlePresetClick(usdVal)}
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

            {/* Middle: vertical separator + “OR” */}
            <div className="hidden h-full flex-col items-center sm:flex">
              <Separator orientation="vertical" className="flex-1" />
              <span className="my-2 text-sm font-medium text-muted-foreground">
                OR
              </span>
              <Separator orientation="vertical" className="flex-1" />
            </div>

            {/* Right: Custom Amount */}
            <div>
              <Label
                htmlFor="custom-usd"
                className="mb-1 block text-sm font-semibold"
              >
                Enter your own
              </Label>
              <div className="relative group">
                <span className="absolute left-2 inset-y-0 flex items-center pointer-events-none text-sm font-semibold text-muted-foreground group-focus-within:text-card-foreground">
                  $
                </span>
                <Input
                  id="custom-usd"
                  type="number"
                  placeholder="e.g. 100"
                  value={customUSD}
                  onChange={handleCustomChange}
                  className="h-10 pl-6"
                />
              </div>

              {tokenFloat > 0 && selectedUSD === null && (
                <p className="text-sm text-muted-foreground">
                  ~{tokenFloat.toFixed(3)} {nativeSymbol}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          size="lg"
          onClick={onClick}
          disabled={!donationAmountWei || isPending}
          className="w-full"
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
