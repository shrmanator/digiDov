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

export default function DonationForm({
  charityWalletAddress,
}: DonationFormProps) {
  // Predefined USD amounts
  const presetUsdAmounts = [10, 20, 50];

  // Track selected and custom USD amounts
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");

  // Initialize Web3 and get the chain info
  const web3 = new Web3();
  const activeChain = useActiveWalletChain();
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH"; // e.g. "ETH", "MATIC"
  const decimals = activeChain?.nativeCurrency?.decimals || 18; // e.g. 18

  // Real-time token price (USD)
  const tokenPriceUSD = usePriceWebSocket(nativeSymbol);

  // Convert USD to smallest token units (e.g. wei)
  const donationAmountWei = (() => {
    if (!tokenPriceUSD) return null;

    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
    if (usdValue <= 0) return null;

    const tokenAmount = usdValue / tokenPriceUSD;
    return decimals === 18
      ? BigInt(web3.utils.toWei(tokenAmount.toString(), "ether"))
      : BigInt(Math.floor(tokenAmount * 10 ** decimals));
  })();

  // For displaying approximate token amount when using custom USD
  const customTokenAmount = (() => {
    if (!tokenPriceUSD) return 0;
    const val = parseFloat(customUSD || "0");
    return val > 0 ? val / tokenPriceUSD : 0;
  })();

  // Hook to send the donation transaction
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
    <Card className="mx-auto w-full max-w-md border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Donate</CardTitle>
        <CardDescription>
          Select or enter a USD amount. We’ll convert it to {nativeSymbol}.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* If price is still loading */}
        {!tokenPriceUSD ? (
          <p>Loading live token price...</p>
        ) : (
          <>
            {/* Preset buttons */}
            <div className="grid grid-cols-3 gap-2">
              {presetUsdAmounts.map((usdVal) => {
                const isSelected = selectedUSD === usdVal;
                const approxTokens = usdVal / tokenPriceUSD;
                return (
                  <Button
                    key={usdVal}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handlePresetClick(usdVal)}
                  >
                    ${usdVal}
                    <br />
                    (~{approxTokens.toFixed(4)} {nativeSymbol})
                  </Button>
                );
              })}
            </div>

            <Separator />

            {/* Custom amount input */}
            <div className="space-y-2">
              <Label htmlFor="custom-usd">Custom USD Amount</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="custom-usd"
                  type="number"
                  placeholder="e.g. 100"
                  value={customUSD}
                  onChange={handleCustomChange}
                  className="max-w-[120px]"
                />
                {customTokenAmount > 0 && (
                  <span className="text-sm text-gray-500">
                    ≈ {customTokenAmount.toFixed(4)} {nativeSymbol}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button
          size="lg"
          onClick={onClick}
          disabled={!donationAmountWei || isPending}
          className="w-full"
        >
          {isPending
            ? "Processing..."
            : transactionResult
            ? "Donation Sent!"
            : "Donate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
