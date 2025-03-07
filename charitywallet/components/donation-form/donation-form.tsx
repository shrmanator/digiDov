"use client";

import { useEffect, useState, useMemo } from "react";
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
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { usePriceWebSocket } from "@/hooks/use-crypto-to-usd";
import { useDonationCalculator } from "@/hooks/use-donation-calculator";
import { useAuth } from "@/contexts/auth-context";
import { useSendWithFee } from "@/hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "../new-donor-modal/new-donor-modal";
import { AmountSelector } from "./amount-selector";
import { DonationLoading } from "./donation-loading";
import { DonationSummary } from "./donation-summary";

interface DonationFormProps {
  charity: charity;
}

export default function DonationForm({ charity }: DonationFormProps) {
  // Constants
  const PRESET_USD_AMOUNTS = [10, 20, 50];

  // State
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [calculatedChainId, setCalculatedChainId] = useState<
    number | undefined
  >(undefined);

  // Hooks
  const { donor } = useAuth();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();
  const web3 = useMemo(() => new Web3(), []);

  // Get the native symbol and decimals from the active chain
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  // Retrieve token price using the active chain's native currency
  const tokenPrice = usePriceWebSocket(nativeSymbol, "CAD");

  // Calculate donation with fees
  const {
    donationAmountWei,
    tokenFloat,
    charityReceives,
    feeAmount,
    totalPaid,
  } = useDonationCalculator({
    tokenPrice,
    selectedUSD,
    customUSD,
    decimals,
    web3,
    coverFee,
    feePercentage: 0.03,
  });

  // Update calculatedChainId whenever activeChain or tokenPrice updates
  useEffect(() => {
    if (activeChain?.id && tokenPrice !== null && tokenPrice > 0) {
      setCalculatedChainId(activeChain.id);
    } else if (activeChain?.id !== calculatedChainId) {
      setCalculatedChainId(undefined);
    }
  }, [activeChain, tokenPrice, calculatedChainId]);

  // Open modal if profile not complete
  useEffect(() => {
    if (!walletAddress || donor === null) return;

    if (!donor.is_profile_complete) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      document.body.style.removeProperty("pointer-events");
      document.body.removeAttribute("data-scroll-locked");
    }
  }, [walletAddress, donor]);

  // Transaction handler from the hook
  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

  // Event handlers
  const handlePresetClick = (usdVal: number) => {
    setSelectedUSD(usdVal);
    setCustomUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUSD(e.target.value);
    setSelectedUSD(null);
  };

  const handleCoverFeeChange = () => {
    setCoverFee(!coverFee);
  };

  const handleDonationClick = () => {
    if (calculatedChainId !== activeChain?.id) return;
    onClick();
  };

  // Dynamic button label
  const buttonLabel = useMemo(() => {
    if (isPending) return "Processing...";
    if (transactionResult) return "Donation Sent!";
    if (tokenFloat > 0) {
      return `Donate ${totalPaid.toFixed(2)} CAD`;
    }
    return "Donate";
  }, [isPending, transactionResult, tokenFloat, totalPaid]);

  return (
    <>
      {donor !== null && walletAddress && !donor.is_profile_complete && (
        <DonorProfileModal
          walletAddress={walletAddress}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
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
          {!tokenPrice ? (
            <DonationLoading />
          ) : (
            <AmountSelector
              presetAmounts={PRESET_USD_AMOUNTS}
              selectedAmount={selectedUSD}
              customAmount={customUSD}
              onPresetClick={handlePresetClick}
              onCustomChange={handleCustomChange}
              tokenPrice={tokenPrice}
              nativeSymbol={nativeSymbol}
              tokenFloat={tokenFloat}
            />
          )}

          {tokenPrice && charityReceives > 0 && (
            <DonationSummary
              coverFee={coverFee}
              onCoverFeeChange={handleCoverFeeChange}
              selectedUSD={selectedUSD}
              customUSD={customUSD}
              charityReceives={charityReceives}
              feeAmount={feeAmount}
              tokenFloat={tokenFloat}
              nativeSymbol={nativeSymbol}
              charityName={charity.charity_name ?? "Charity"}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col pt-6">
          {donor?.email && (
            <p className="text-xs text-muted-foreground mb-3 text-center w-full">
              A tax receipt will be emailed to {donor.email}
            </p>
          )}
          <Button
            size="lg"
            onClick={handleDonationClick}
            disabled={
              !donationAmountWei ||
              isPending ||
              calculatedChainId !== activeChain?.id
            }
            className="w-full"
          >
            {calculatedChainId !== activeChain?.id
              ? "Updating conversion..."
              : buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
