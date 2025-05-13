// donation-form-with-approval.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "@/contexts/auth-context";
import { useSendWithFee, SendWithFeeStatus } from "@/hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "../new-donor-modal/new-donor-modal";
import { CheckCircle, Loader2 } from "lucide-react";
import { USDCAmountInput } from "./usdc-amount-input";
import { getContract } from "thirdweb";
import { getBalance } from "thirdweb/extensions/erc20";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";

// ERC20 token address
const ERC20_POLYGON_MAINNET_ADDRESS =
  "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";

interface DonationFormProps {
  charity: charity;
}

const PRESET_USDC_AMOUNTS = [10, 20, 50];
const FEE_PERCENTAGE = 0.03;

export default function DonationForm({ charity }: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  const { donor } = useAuth();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address ?? "";

  // Calculate amounts
  const donationAmount = customAmount
    ? parseFloat(customAmount) || 0
    : selectedAmount || 0;
  const feeAmount = coverFee
    ? (donationAmount * FEE_PERCENTAGE) / (1 - FEE_PERCENTAGE)
    : donationAmount * FEE_PERCENTAGE;
  const totalAmount = coverFee ? donationAmount + feeAmount : donationAmount;
  const charityReceives = coverFee
    ? donationAmount
    : donationAmount - feeAmount;
  const hasSufficientBalance = balanceAmount >= totalAmount;

  // Fetch USDC balance
  useEffect(() => {
    if (!walletAddress) return;
    (async () => {
      try {
        const contract = getContract({
          client,
          address: ERC20_POLYGON_MAINNET_ADDRESS,
          chain: polygon,
        });
        const bal = await getBalance({ contract, address: walletAddress });
        setBalanceAmount(Number(bal.displayValue));
      } catch (err) {
        console.error("Failed to fetch USDC balance:", err);
      }
    })();
  }, [walletAddress]);

  // Send with fee hook
  const { onClick, status } = useSendWithFee(
    BigInt(Math.floor(totalAmount * 1_000_000)),
    charity.wallet_address
  );

  // Profile modal logic
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

  // Reset on success
  useEffect(() => {
    if (status === "success") {
      setDonationSuccess(true);
      const timer = setTimeout(() => {
        setDonationSuccess(false);
        setSelectedAmount(null);
        setCustomAmount("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handlers
  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };
  const handleCustomAmountChange = (value: string, isValid: boolean) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  // Button states
  const isLoading = status === "approving" || status === "donating";
  const isDisabled = donationAmount <= 0 || isLoading || !hasSufficientBalance;
  const buttonLabel = isLoading ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {status === "approving" ? "Approving…" : "Sending donation…"}
    </>
  ) : donationSuccess ? (
    <>
      Donation Sent!
      <CheckCircle className="ml-2 h-5 w-5 inline-block animate-pulse" />
    </>
  ) : (
    `Donate ${totalAmount.toFixed(2)} USDC`
  );

  return (
    <>
      {donor && walletAddress && !donor.is_profile_complete && (
        <DonorProfileModal
          walletAddress={walletAddress}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <Card className="mx-auto w-full max-w-xl border bg-card text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold capitalize">
            Donate to {charity.charity_name}
          </CardTitle>
          <CardDescription className="mt-1">
            Choose or enter amount
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Preset amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_USDC_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant={selectedAmount === amt ? "default" : "outline"}
                  onClick={() => handlePresetClick(amt)}
                  disabled={amt > balanceAmount}
                  className={`w-full ${
                    amt > balanceAmount ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {amt} USDC
                </Button>
              ))}
            </div>

            {/* Custom amount */}
            <div>
              <USDCAmountInput
                value={customAmount}
                onChange={handleCustomAmountChange}
                minAmount={0.02}
                className={`w-full ${
                  donationAmount > balanceAmount
                    ? "border-2 border-red-500"
                    : ""
                }`}
                placeholder="Custom amount"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-muted-foreground">
                  Balance: {balanceAmount.toFixed(2)} USDC
                </p>
                <button
                  type="button"
                  onClick={() => setCustomAmount(balanceAmount.toString())}
                  className="text-sm font-medium text-primary"
                >
                  Use max
                </button>
              </div>
              {donationAmount > balanceAmount && (
                <p className="text-sm text-red-600 mt-1">
                  Exceeds available balance.
                </p>
              )}
            </div>

            {/* Summary */}
            {donationAmount > 0 && hasSufficientBalance && (
              <div className="mt-6 space-y-2 p-4 border rounded-md bg-background">
                <div className="flex justify-between">
                  <span>Donation amount:</span>
                  <span>{donationAmount.toFixed(2)} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="coverFee"
                      checked={coverFee}
                      onChange={() => setCoverFee(!coverFee)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="coverFee" className="text-sm">
                      Cover fee ({(FEE_PERCENTAGE * 100).toFixed()}%)
                    </label>
                  </div>
                  <span>{feeAmount.toFixed(2)} USDC</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>You pay:</span>
                    <span>{totalAmount.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground capitalize">
                    <span>{charity.charity_name} receives:</span>
                    <span>{charityReceives.toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col pt-6">
          {donor?.email && (
            <p className="text-xs text-muted-foreground mb-2 text-center w-full">
              A tax receipt will be emailed to {donor.email}
            </p>
          )}
          <Button
            size="lg"
            onClick={onClick}
            disabled={isDisabled}
            className="w-full"
          >
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
