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
import { useDonationCalculator } from "@/hooks/use-donation-calculator";
import { useAuth } from "@/contexts/auth-context";
import { useSendWithFee } from "@/hooks/use-send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "../new-donor-modal/new-donor-modal";
import { AmountSelector } from "./amount-selector";
import { DonationLoading } from "./donation-loading";
import { DonationSummary } from "./donation-summary";
import { CheckCircle, Loader2 } from "lucide-react"; // Added CheckCircle icon
import { useLogin } from "@/hooks/use-thirdweb-headless-login";
import { useStaticConversionRate } from "@/hooks/use-current-crypto-price";

// Types
interface DonationFormProps {
  charity: charity;
}

const PRESET_USD_AMOUNTS = [10, 20, 50];
const FEE_PERCENTAGE = 0.03;

export default function DonationForm({ charity }: DonationFormProps) {
  // State management
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [calculatedChainId, setCalculatedChainId] = useState<
    number | undefined
  >(undefined);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Hooks
  const { donor } = useAuth();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();
  const web3 = useMemo(() => new Web3(), []);
  const { login, account } = useLogin();

  // Chain data
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;
  // External data using static conversion rate hook
  const activeChainId = (activeChain?.id ?? 1).toString(); // fallback to Ethereum chain ID (1 => 0x1)
  const { conversionRate: tokenPrice, error: conversionRateError } =
    useStaticConversionRate(activeChainId, "usd");

  useEffect(() => {
    if (conversionRateError) {
      console.error("Conversion hook error:", conversionRateError);
    }
  }, [conversionRateError]);

  // Derived calculations
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
    feePercentage: FEE_PERCENTAGE,
  });

  // Transaction handler
  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

  // Update chain ID when chain or price changes
  useEffect(() => {
    if (activeChain?.id && tokenPrice !== null && tokenPrice > 0) {
      setCalculatedChainId(activeChain.id);
    }
  }, [activeChain?.id, tokenPrice]);

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
      // Reset success state and form after animation completes (5 seconds)
      const timer = setTimeout(() => {
        setDonationSuccess(false);
        // Reset form values
        setSelectedUSD(null);
        setCustomUSD("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionResult]);

  // Event handlers
  const handlePresetClick = (usdVal: number) => {
    setSelectedUSD(usdVal);
    setCustomUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUSD(e.target.value);
    setSelectedUSD(null);
  };

  const handleDonationClick = async () => {
    // If the user is not connected, trigger the login (which opens the wallet modal)
    if (!account) {
      await login();
      return;
    }

    // Ensure the chain conversion is up-to-date before sending donation
    if (calculatedChainId !== activeChain?.id) return;

    // Proceed with sending the donation
    onClick();
  };

  // Computed values
  const buttonLabel = useMemo(() => {
    if (isPending) return "Processing...";
    if (donationSuccess) return "Donation Sent!";
    if (tokenFloat > 0) return `Donate $${totalPaid.toFixed(2)} USD`;
    return "Donate";
  }, [isPending, donationSuccess, tokenFloat, totalPaid]);

  const isButtonDisabled =
    !donationAmountWei || isPending || calculatedChainId !== activeChain?.id;
  const showConversionMessage = calculatedChainId !== activeChain?.id;
  const showDonationSummary = tokenPrice && charityReceives > 0;

  // Success button styles
  const buttonClasses = `w-full ${
    donationSuccess
      ? "bg-green-600 hover:bg-green-700 transition-all duration-500 ease-in-out"
      : ""
  }`;

  return (
    <>
      {renderDonorProfileModal()}
      <Card className="mx-auto w-full max-w-xl border bg-card text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold capitalize">
            Donate to {charity.charity_name}
          </CardTitle>
          <CardDescription className="mt-1">
            Amount will be sent in {nativeSymbol}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!tokenPrice ? renderDonationLoading() : renderAmountSelector()}
          {showDonationSummary && renderDonationSummary()}
        </CardContent>

        <CardFooter className="flex flex-col">
          {renderTaxReceiptMessage()}
          <Button
            size="lg"
            onClick={handleDonationClick}
            disabled={isButtonDisabled}
            className={buttonClasses}
          >
            {showConversionMessage ? (
              "Getting conversion rates..."
            ) : isPending ? (
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

  // Component rendering functions
  function renderDonorProfileModal() {
    return (
      donor !== null &&
      walletAddress &&
      !donor.is_profile_complete && (
        <DonorProfileModal
          walletAddress={walletAddress}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )
    );
  }

  function renderDonationLoading() {
    return <DonationLoading />;
  }

  function renderAmountSelector() {
    return (
      <AmountSelector
        presetAmounts={PRESET_USD_AMOUNTS}
        selectedAmount={selectedUSD}
        customAmount={customUSD}
        onPresetClick={handlePresetClick}
        onCustomChange={handleCustomChange}
        tokenPrice={tokenPrice ?? 0}
        nativeSymbol={nativeSymbol}
        tokenFloat={tokenFloat}
      />
    );
  }

  function renderDonationSummary() {
    return (
      <DonationSummary
        coverFee={coverFee}
        onCoverFeeChange={() => setCoverFee(!coverFee)}
        selectedUSD={selectedUSD}
        customUSD={customUSD}
        charityReceives={charityReceives}
        feeAmount={feeAmount}
        tokenFloat={tokenFloat}
        nativeSymbol={nativeSymbol}
        charityName={charity.charity_name ?? "Charity"}
      />
    );
  }

  function renderTaxReceiptMessage() {
    return (
      <p className="text-xs text-muted-foreground mb-2 text-center w-full">
        A tax receipt will be emailed to {donor?.email ?? "you"}
      </p>
    );
  }
}
