"use client";

import React, { useState, useCallback, useMemo } from "react";
import Web3 from "web3";
import { useActiveWalletChain } from "thirdweb/react";
import { useConversionRate } from "@/hooks/use-current-conversion-rate";
import { useDonationCalculator } from "@/hooks/use-donation-calculator";
import { useDonate } from "@/hooks/use-donate";
import type { charity } from "@prisma/client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AmountSelector } from "@/components/donation-form/amount-selector";
import { DonationLoading } from "@/components/donation-form/donation-loading";
import { ErrorBanner } from "@/components/donation-form/error-banner";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { DonationSummary } from "./donation-summary";

const PRESET_AMOUNTS = [10, 20, 50];
const FEE_PERCENTAGE = 0.03;

interface DonationFormProps {
  charity: charity;
}

export default function DonationForm({ charity }: DonationFormProps) {
  const chain = useActiveWalletChain();
  const rawId = chain?.id;
  const chainId = String(rawId ?? 1);
  const nativeSymbol = chain?.nativeCurrency?.symbol ?? "ETH";
  const decimals = chain?.nativeCurrency?.decimals ?? 18;

  // Local UI state
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");
  const [coverFee, setCoverFee] = useState(true);

  const handlePresetClick = useCallback((amt: number) => {
    setSelectedUSD(amt);
    setCustomUSD("");
  }, []);

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomUSD(e.target.value);
      setSelectedUSD(null);
    },
    []
  );

  const toggleCoverFee = useCallback(() => {
    setCoverFee((f) => !f);
  }, []);

  // Data fetching
  const {
    conversionRate: rate,
    isLoading: rateLoading,
    isError: rateError,
  } = useConversionRate(chainId, "usd");

  // Web3 instance
  const web3 = useMemo(() => new Web3(), []);

  // Donation calculations
  const {
    donationAmountWei,
    tokenFloat,
    charityReceives,
    feeAmount,
    totalPaid,
  } = useDonationCalculator({
    tokenPrice: rate,
    selectedUSD,
    customUSD,
    decimals,
    web3,
    coverFee,
    feePercentage: FEE_PERCENTAGE,
  });

  // Donation transaction
  const {
    onDonate,
    isSending,
    txResult,
    error: donateError,
  } = useDonate(donationAmountWei ?? BigInt(0), charity.wallet_address);

  return (
    <Card className="mx-auto w-full max-w-xl border bg-card text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Donate to {charity.charity_name}
        </CardTitle>
        <CardDescription>Amount will be sent in {nativeSymbol}</CardDescription>
      </CardHeader>

      <CardContent>
        {rateLoading ? (
          <DonationLoading />
        ) : rateError || rate == null ? (
          <ErrorBanner message="Unable to fetch conversion rate. Please try again later." />
        ) : (
          <>
            <AmountSelector
              presetAmounts={PRESET_AMOUNTS}
              selectedAmount={selectedUSD}
              customAmount={customUSD}
              onPresetClick={handlePresetClick}
              onCustomChange={handleCustomChange}
              tokenPrice={rate}
              nativeSymbol={nativeSymbol}
              tokenFloat={tokenFloat}
            />

            <DonationSummary
              coverFee={coverFee}
              feeAmount={feeAmount}
              onToggleCoverFee={toggleCoverFee}
            />
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2">
        {donateError && (
          <ErrorBanner message={`Donation failed: ${donateError.message}`} />
        )}
        <Button
          size="lg"
          onClick={onDonate}
          disabled={
            isSending || rateLoading || rateError || donationAmountWei === null
          }
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
            </>
          ) : txResult ? (
            <>
              Sent <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
            </>
          ) : (
            `Donate $${totalPaid.toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
