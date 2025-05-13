// donation-form-with-approval.tsx
"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActiveAccount, PayEmbed, getDefaultToken } from "thirdweb/react";
import { useAuth } from "@/contexts/auth-context";
import { useSendWithFee } from "@/hooks/use-send-with-fee";
import { POLYGON_USDC_ADDRESS } from "@/constants/blockchain";
import { charity } from "@prisma/client";
import DonorProfileModal from "../new-donor-modal/new-donor-modal";
import { Loader2 } from "lucide-react";
import { USDCAmountInput } from "./usdc-amount-input";
import { getContract } from "thirdweb";
import { getBalance } from "thirdweb/extensions/erc20";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";

function useUSDCBalance(address?: string) {
  const [balance, setBalance] = useState<number>(0);
  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const contract = getContract({
          client,
          address: POLYGON_USDC_ADDRESS,
          chain: polygon,
        });
        const result = await getBalance({ contract, address });
        setBalance(Number(result.displayValue));
      } catch (e) {
        console.error("Error fetching balance", e);
      }
    })();
  }, [address]);
  return balance;
}

interface DonationFormProps {
  charity: charity;
}
const PRESET_AMOUNTS = [10, 20, 50];
const FEE_RATE = 0.03;

export default function DonationForm({ charity }: DonationFormProps) {
  const { donor } = useAuth();
  const account = useActiveAccount();
  const wallet = account?.address || "";

  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState<string>("");
  const [coverFee] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFundEmbed, setShowFundEmbed] = useState(false);

  const balance = useUSDCBalance(wallet);
  const amount = custom ? parseFloat(custom) || 0 : preset || 0;
  const fee = coverFee
    ? (amount * FEE_RATE) / (1 - FEE_RATE)
    : amount * FEE_RATE;
  const total = amount + fee;
  const charityGets = coverFee ? amount : amount - fee;

  const { onClick, status } = useSendWithFee(
    BigInt(Math.floor(total * 1_000_000)),
    charity.wallet_address
  );
  const loading = status === "approving" || status === "donating";
  const isDisabled = amount <= 0 || loading;
  const label = loading
    ? status === "approving"
      ? "Approving…"
      : "Sending…"
    : showSuccess
    ? "Sent!"
    : `Donate ${total.toFixed(2)} USDC`;

  useEffect(() => {
    if (status === "success") {
      setShowSuccess(true);
      const t = setTimeout(() => {
        setShowSuccess(false);
        setPreset(null);
        setCustom("");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleDonate = () => {
    if (total > balance) {
      setShowFundEmbed(true);
    } else {
      onClick();
    }
  };

  // Render PayEmbed at the top, using a portal for modal overlay
  // Full-screen overlay modal for PayEmbed
  // Full-screen overlay modal for PayEmbed with close icon
  const embed = showFundEmbed ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-background p-6 rounded-2xl shadow-lg">
        {/* Close icon top-right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => setShowFundEmbed(false)}
        ></Button>
        <PayEmbed
          client={client}
          payOptions={{
            mode: "fund_wallet",
            buyWithCrypto: false,
            prefillBuy: {
              chain: polygon,
              amount: total.toString(),
              token: getDefaultToken(polygon, "USDC"),
            },
            metadata: { name: "Fund your wallet with USDC" },
          }}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      {embed && typeof document !== "undefined"
        ? ReactDOM.createPortal(embed, document.body)
        : embed}

      {donor && !donor.is_profile_complete && (
        <DonorProfileModal open onClose={() => {}} walletAddress={wallet} />
      )}

      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Donate to {charity.charity_name}</CardTitle>
          <CardDescription>Pick or enter an amount</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map((n) => (
              <Button
                key={n}
                variant={preset === n ? "default" : "outline"}
                onClick={() => {
                  setPreset(n);
                  setCustom("");
                }}
                disabled={n + fee > balance}
                className="w-full"
              >
                {n} USDC
              </Button>
            ))}
          </div>

          <div className="mb-4">
            <USDCAmountInput
              value={custom}
              onChange={(v) => {
                setCustom(v);
                setPreset(null);
              }}
              className="w-full"
              placeholder={`Custom (max ${balance.toFixed(2)} USDC)`}
            />
            {total > balance && (
              <p className="text-destructive mt-1">
                Exceeds available balance.
              </p>
            )}
          </div>

          {amount > 0 && total <= balance && (
            <div className="space-y-2 p-4 border border-border rounded-md bg-background mb-4">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>{amount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span>Fee:</span>
                <span>{fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-medium">
                  <span>You pay:</span>
                  <span>{total.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{charityGets.toFixed(2)} to charity</span>
                </div>
              </div>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleDonate}
            disabled={isDisabled}
            className="w-full"
          >
            {loading && <Loader2 className="animate-spin mr-2" />} {label}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
