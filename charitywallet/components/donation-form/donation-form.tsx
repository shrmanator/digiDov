"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { useSendWithFee } from "@/hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "../new-donor-modal/new-donor-modal";
import { CheckCircle, Loader2 } from "lucide-react";

// Types
interface DonationFormProps {
  charity: charity;
}

const PRESET_USDC_AMOUNTS = [10, 20, 50];
const FEE_PERCENTAGE = 0.03;

export default function DonationForm({ charity }: DonationFormProps) {
  // State management
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Hooks
  const { donor } = useAuth();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();

  // Calculate donation amounts
  const donationAmount =
    selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  // If covering fee, calculate how much extra is needed to ensure charity gets full amount
  const feeAmount = coverFee
    ? (donationAmount * FEE_PERCENTAGE) / (1 - FEE_PERCENTAGE)
    : donationAmount * FEE_PERCENTAGE;
  const totalAmount = coverFee ? donationAmount + feeAmount : donationAmount;
  const charityReceives = coverFee
    ? donationAmount
    : donationAmount - feeAmount;

  // Transaction handler - adjust this to handle USDC transfers
  const { onClick, isPending, transactionResult } = useSendWithFee(
    BigInt(Math.floor(donationAmount * 1000000)), // USDC has 6 decimals
    charity.wallet_address
  );

  // Check for incomplete profiles
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

  // Handle successful donation animation and form reset
  useEffect(() => {
    if (transactionResult) {
      setDonationSuccess(true);
      // Reset success state and form after animation completes
      const timer = setTimeout(() => {
        setDonationSuccess(false);
        // Reset form values
        setSelectedAmount(null);
        setCustomAmount("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionResult]);

  // Event handlers
  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  // Button state
  const buttonLabel = isPending
    ? "Processing..."
    : donationSuccess
    ? "Donation Sent!"
    : `Donate ${totalAmount.toFixed(2)} USDC`;

  const isButtonDisabled = !donationAmount || isPending;

  // Success button styles
  const buttonClasses = `w-full ${
    donationSuccess
      ? "bg-green-600 hover:bg-green-700 transition-all duration-500 ease-in-out"
      : ""
  }`;
  console.log("charity", charity);
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
          <CardTitle className="text-2xl font-bold capitalize">
            Donate to {charity.charity_name}
          </CardTitle>
          <CardDescription className="mt-1">
            Choose or enter amount
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Amount Selector */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_USDC_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handlePresetClick(amount)}
                  className="w-full"
                >
                  {amount} USDC
                </Button>
              ))}
            </div>

            <div className="relative flex">
              <div className="flex items-center justify-center px-4 bg-muted border border-input rounded-l-md text-sm">
                USDC
              </div>
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={handleCustomChange}
                className="flex-1 h-10 px-4 py-2 rounded-r-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Donation Summary */}
          {donationAmount > 0 && (
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
                    Cover transaction fee ({(FEE_PERCENTAGE * 100).toFixed()}%)
                  </label>
                </div>
                <span>{feeAmount.toFixed(2)} USDC</span>
              </div>

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>You pay:</span>
                  <span>{totalAmount.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{charity.charity_name} receives:</span>
                  <span>{charityReceives.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          )}
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
            disabled={isButtonDisabled}
            className={buttonClasses}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {buttonLabel}
                {donationSuccess && (
                  <CheckCircle className="ml-2 h-5 w-5 inline-block animate-pulse" />
                )}
              </>
            )}
          </Button>

          {donationSuccess && (
            <p className="text-green-600 mt-2 text-center font-medium animate-pulse">
              Thank you for your generosity!
            </p>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
