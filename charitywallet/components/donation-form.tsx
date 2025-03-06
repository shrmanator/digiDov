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
import { Checkbox } from "@/components/ui/checkbox";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { usePriceWebSocket } from "@/hooks/use-crypto-to-usd";
import { useSendWithFee } from "../hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "./new-donor-modal/new-donor-modal";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle } from "lucide-react";
import { useLogin } from "./thidweb-headless-login-button";

interface DonationFormProps {
  charity: charity;
}

export default function DonationForm({ charity }: DonationFormProps) {
  // Constants
  const PRESET_USD_AMOUNTS = [10, 20, 50];
  const PROCESSING_FEE_PERCENTAGE = 0.03; // 3%

  // State
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverFee, setCoverFee] = useState(true);

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
  const { login, account } = useLogin();

  // Open modal if profile not complete
  useEffect(() => {
    if (!walletAddress || donor === null) return;

    if (!isProfileComplete) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      // Cleanup any modal styles
      document.body.style.removeProperty("pointer-events");
      document.body.removeAttribute("data-scroll-locked");
    }
  }, [walletAddress, donor, isProfileComplete]);

  // Calculate donation amount with fee
  const {
    donationAmountWei,
    tokenFloat,
    charityReceives,
    feeAmount,
    totalPaid,
  } = useMemo(() => {
    if (!tokenPrice) {
      return {
        donationAmountWei: null,
        tokenFloat: 0,
        charityReceives: 0,
        feeAmount: 0,
        totalPaid: 0,
      };
    }

    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");

    if (usdValue <= 0) {
      return {
        donationAmountWei: null,
        tokenFloat: 0,
        charityReceives: 0,
        feeAmount: 0,
        totalPaid: 0,
      };
    }

    let fee = usdValue * PROCESSING_FEE_PERCENTAGE;
    let charityAmount, total;

    if (coverFee) {
      // User covers the fee (fee added on top)
      charityAmount = usdValue;
      total = usdValue + fee;
    } else {
      // Fee subtracted from donation
      charityAmount = usdValue - fee;
      total = usdValue;
    }

    // Calculate token amount based on charity's receiving amount
    const tokenAmount = charityAmount / tokenPrice;
    const amountWei =
      decimals === 18
        ? BigInt(web3.utils.toWei(tokenAmount.toFixed(18), "ether"))
        : BigInt(Math.floor(tokenAmount * 10 ** decimals));

    return {
      donationAmountWei: amountWei,
      tokenFloat: tokenAmount,
      charityReceives: charityAmount,
      feeAmount: fee,
      totalPaid: total,
    };
  }, [tokenPrice, selectedUSD, customUSD, decimals, web3, coverFee]);

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
      return `Donate ${totalPaid.toFixed(2)} CAD`;
    }
    return "Donate";
  }, [isPending, transactionResult, tokenFloat, totalPaid]);

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

  // UI: loading skeleton for initial price fetch
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

  const renderFeeBreakdown = () => {
    if (charityReceives <= 0) return null;

    return (
      <div className="mt-6 p-4 bg-muted/50 rounded-md">
        <h4 className="font-medium mb-2">Donation Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              id="cover-fee"
              checked={coverFee}
              onCheckedChange={handleCoverFeeChange}
            />
            <Label
              htmlFor="cover-fee"
              className="text-sm font-medium cursor-pointer"
            >
              Cover the 3% platform fee
            </Label>
          </div>

          {coverFee ? (
            <>
              <div className="flex justify-between">
                <span>You pay:</span>
                <span>
                  $
                  {selectedUSD !== null
                    ? selectedUSD
                    : parseFloat(customUSD || "0").toFixed(2)}{" "}
                  CAD
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Processing fee (3%):</span>
                <span>${feeAmount.toFixed(2)} CAD</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>
                  {(charity.charity_name ?? "Charity").length > 20
                    ? `${(charity.charity_name ?? "Charity").slice(0, 20)}...`
                    : charity.charity_name ?? "Charity"}{" "}
                  receives:
                </span>
                <span>${charityReceives.toFixed(2)} CAD</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span>You pay:</span>
                <span>
                  $
                  {selectedUSD !== null
                    ? selectedUSD
                    : parseFloat(customUSD || "0").toFixed(2)}{" "}
                  CAD
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Processing fee (3%):</span>
                <span>-${feeAmount.toFixed(2)} CAD</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>
                  {(charity.charity_name ?? "Charity").length > 20
                    ? `${(charity.charity_name ?? "Charity").slice(0, 20)}...`
                    : charity.charity_name ?? "Charity"}{" "}
                  receives:
                </span>
                <span>${charityReceives.toFixed(2)} CAD</span>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground text-right mt-1">
            ~{tokenFloat.toFixed(5)} {nativeSymbol} sent to charity
          </div>
        </div>
      </div>
    );
  };

  // Donation Click Handler
  const handleDonateClick = async () => {
    if (!walletAddress) {
      await login(); // Trigger Thirdweb login modal
    } else {
      onClick(); // Proceed with donation
    }
  };

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
          {tokenPrice && charityReceives > 0 && renderFeeBreakdown()}
        </CardContent>
        <CardFooter className="flex flex-col pt-6">
          <p className="text-xs text-muted-foreground mb-3 text-center w-full flex items-center justify-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Tax receipt will be sent to{" "}
            {donor?.email ? donor.email : "your email"}
          </p>
          <Button
            size="lg"
            onClick={handleDonateClick} // Always enabled
            disabled={isPending} // Only disable during transaction
            className="w-full"
          >
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
