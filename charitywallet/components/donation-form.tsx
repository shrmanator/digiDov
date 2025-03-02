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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { usePriceWebSocket } from "@/hooks/use-crypto-to-usd";
import { useSendWithFee } from "../hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "./new-donor-modal/new-donor-modal";
import { useAuth } from "@/contexts/auth-context";

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

  // Hooks
  const { donor } = useAuth();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();
  const web3 = useMemo(() => new Web3(), []);

  // Derived values
  const isProfileComplete = donor?.is_profile_complete ?? false;
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  const tokenPrice = usePriceWebSocket(nativeSymbol, "CAD");

  // Open modal if profile not complete
  useEffect(() => {
    if (!walletAddress || donor === null) return;

    if (!isProfileComplete) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      // Cleanup any modal styles (we are closing the modal based on donor profile completeness, preventing the modal's default cleanup logic).
      document.body.style.removeProperty("pointer-events");
      document.body.removeAttribute("data-scroll-locked");
    }
  }, [walletAddress, donor, isProfileComplete]);

  // Calculate donation amount
  const { donationAmountWei, tokenFloat, chosenUSD } = useMemo(() => {
    if (!tokenPrice) {
      return { donationAmountWei: null, tokenFloat: 0, chosenUSD: 0 };
    }

    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");

    if (usdValue <= 0) {
      return { donationAmountWei: null, tokenFloat: 0, chosenUSD: 0 };
    }

    const tokenAmount = usdValue / tokenPrice;

    const amountWei =
      decimals === 18
        ? BigInt(web3.utils.toWei(tokenAmount.toFixed(18), "ether"))
        : BigInt(Math.floor(tokenAmount * 10 ** decimals));

    return {
      donationAmountWei: amountWei,
      tokenFloat: tokenAmount,
      chosenUSD: usdValue,
    };
  }, [tokenPrice, selectedUSD, customUSD, decimals, web3]);

  // Transaction handler
  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

  // Dynamic button label
  const buttonLabel = useMemo(() => {
    if (isPending) return "Processing...";
    if (transactionResult) return "Donation Sent!";
    if (tokenFloat > 0) {
      return `Donate ${chosenUSD.toFixed(2)} (${tokenFloat.toFixed(
        3
      )} ${nativeSymbol})`;
    }
    return "Donate";
  }, [isPending, transactionResult, tokenFloat, chosenUSD, nativeSymbol]);

  // Event handlers
  const handlePresetClick = (usdVal: number) => {
    setSelectedUSD(usdVal);
    setCustomUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUSD(e.target.value);
    setSelectedUSD(null);
  };

  // UI Components
  const renderLoadingSkeleton = () => (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="mb-2 h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
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
        <Skeleton className="mb-2 h-5 w-1/2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );

  const renderDonationForm = () => (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-2 block text-sm font-semibold">
          Choose an amount (CAD)
        </Label>
        <div className="space-y-2">
          {PRESET_USD_AMOUNTS.map((usdVal) => {
            const isSelected = selectedUSD === usdVal;
            const approxTokens = (usdVal / tokenPrice!).toFixed(3);
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
  );

  return (
    <>
      {donor !== null && walletAddress && !isProfileComplete && (
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
          {!tokenPrice ? renderLoadingSkeleton() : renderDonationForm()}
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
    </>
  );
}
