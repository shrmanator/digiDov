"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Web3 from "web3";
import { useActiveWalletChain } from "thirdweb/react";
import { useSendWithFee } from "./send-with-fee";
import { usePriceWebSocket } from "@/hooks/use-crypto-to-usd";

interface DonationFormProps {
  charityWalletAddress: string;
}

// In a real app, you might pass `presetUsdAmounts` in as props or fetch from an API.
export default function DonationForm({
  charityWalletAddress,
}: DonationFormProps) {
  const presetUsdAmounts = [10, 20, 50];

  // Track the user’s selected or custom USD
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");

  const web3 = new Web3();
  const activeChain = useActiveWalletChain();
  // e.g. "POL", "ETH", etc.
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  // e.g. 18 for ETH/MATIC
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  // ----- LIVE token price from the WebSocket -----
  // Null until the first price arrives
  const tokenPriceUSD = usePriceWebSocket(nativeSymbol);

  // Convert user’s chosen USD to smallest token units (wei, etc.)
  const donationAmountWei = (() => {
    if (!tokenPriceUSD) return null;

    // Figure out which USD value we’re using
    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
    if (usdValue <= 0) return null;

    // USD -> raw token amount
    const tokenAmount = usdValue / tokenPriceUSD;

    // tokenAmount -> smallest units
    if (decimals === 18) {
      return BigInt(web3.utils.toWei(tokenAmount.toString(), "ether"));
    } else {
      return BigInt(Math.floor(tokenAmount * Math.pow(10, decimals)));
    }
  })();

  // For display: If the user’s typed custom USD, show real-time tokens
  const customTokenAmount = (() => {
    if (!tokenPriceUSD) return 0;
    const val = parseFloat(customUSD || "0");
    return val > 0 ? val / tokenPriceUSD : 0;
  })();

  // Our hook that sends the donation transaction
  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charityWalletAddress
  );

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
    <Card className="mx-auto w-full max-w-md border bg-card text-card-foreground shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">
          Choose a Donation Amount
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Contribute to our cause with a donation in USD (converted live to{" "}
          {nativeSymbol}).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* If we haven't got a price yet, show a loading message */}
        {!tokenPriceUSD ? (
          <p className="text-sm text-muted-foreground">
            Waiting for live price...
          </p>
        ) : (
          <>
            {/* Preset USD amounts (main) + crypto (secondary) */}
            <div className="grid grid-cols-3 gap-2">
              {presetUsdAmounts.map((usdVal) => {
                const isSelected = selectedUSD === usdVal;
                const approxTokens = usdVal / tokenPriceUSD;

                return (
                  <Button
                    key={usdVal}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handlePresetClick(usdVal)}
                    className="flex flex-col items-center justify-center px-2 py-2 space-y-1 text-center"
                  >
                    {/* Primary: USD */}
                    <span className="text-base font-medium leading-tight whitespace-nowrap">
                      ${usdVal.toFixed(2)} USD
                    </span>

                    {/* Secondary: tokens, smaller text */}
                    <span className="text-xs text-muted-foreground leading-tight whitespace-nowrap">
                      (~{approxTokens.toFixed(4)} {nativeSymbol})
                    </span>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-2" />

            {/* Custom USD input */}
            <div className="grid gap-2">
              <Label htmlFor="custom-usd" className="text-sm font-medium">
                Custom Amount (USD)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="custom-usd"
                  type="number"
                  placeholder="e.g. 100"
                  value={customUSD}
                  onChange={handleCustomChange}
                  className="max-w-[150px]"
                />
                {/* Show the token conversion if > 0 */}
                {customTokenAmount > 0 && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    ≈ {customTokenAmount.toFixed(4)} {nativeSymbol}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        {donationAmountWei ? (
          <Button
            onClick={onClick}
            disabled={isPending}
            size="lg"
            className="w-full"
          >
            {isPending
              ? "Processing..."
              : transactionResult
              ? "Donation Sent"
              : "Donate Now"}
          </Button>
        ) : (
          <Button disabled size="lg" className="w-full">
            Please enter a valid donation amount
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
