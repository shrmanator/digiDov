"use client";

import { useEffect, useState } from "react";
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
import { useSendWithFee } from "./send-with-fee";
import { charity } from "@prisma/client";
import DonorProfileModal from "./new-donor-modal/new-donor-modal";
import { useAuth } from "@/contexts/auth-context";

interface DonationFormProps {
  charity: charity;
}

export default function DonationForm({ charity }: DonationFormProps) {
  const presetUsdAmounts = [10, 20, 50];
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");

  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const { donor } = useAuth(); // Get donor data from global context

  // Determine if the donor profile is incomplete
  const isIncomplete = donor ? !donor.is_profile_complete : false;
  // Optionally, you can add a loading state if your context supports it
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      setIsModalOpen(isIncomplete);
    }
  }, [isIncomplete, walletAddress]);

  const web3 = new Web3();
  const activeChain = useActiveWalletChain();
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  // Live token price in USD
  const tokenPriceUSD = usePriceWebSocket(nativeSymbol);

  // Convert chosen USD to smallest native units
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

  // Approximate token float (for button label)
  const tokenFloat = (() => {
    if (!tokenPriceUSD) return 0;
    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");
    if (usdValue <= 0) return 0;
    return usdValue / tokenPriceUSD;
  })();

  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

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

  const handlePresetClick = (usdVal: number) => {
    setSelectedUSD(usdVal);
    setCustomUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUSD(e.target.value);
    setSelectedUSD(null);
  };

  return (
    <>
      {walletAddress && (
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
          {!tokenPriceUSD ? (
            // Skeleton loading state
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
          ) : (
            // Donation form
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block text-sm font-semibold">
                  Choose an amount
                </Label>
                <div className="space-y-2">
                  {presetUsdAmounts.map((usdVal) => {
                    const isSelected = selectedUSD === usdVal;
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
    </>
  );
}
