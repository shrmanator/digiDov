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
import { useDonate } from "@/hooks/use-donate";
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

  const [showProfileModal, setShowProfileModal] = useState(
    donor ? !donor.is_profile_complete : false
  );
  useEffect(() => {
    if (donor) setShowProfileModal(!donor.is_profile_complete);
  }, [donor]);

  const balance = useUSDCBalance(wallet);
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState<string>("");
  const [showFundEmbed, setShowFundEmbed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const amount = custom ? parseFloat(custom) || 0 : preset || 0;
  const fee = (amount * FEE_RATE) / (1 - FEE_RATE);
  const total = amount + fee;
  const charityGets = amount;

  const { onDonate, isSending, didSucceed, error } = useDonate(
    BigInt(Math.floor(total * 1_000_000)),
    charity.wallet_address
  );

  const loading = isSending;
  const isDisabled = amount <= 0 || loading;

  const label = loading
    ? "Sending…"
    : showSuccess
    ? "Sent!"
    : `Donate ${total.toFixed(2)} USDC`;

  useEffect(() => {
    if (didSucceed) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(t);
    }
  }, [didSucceed]);

  // only trigger PayEmbed portal if wallet connected; otherwise directly donate
  const handleDonate = () => {
    if (!account) {
      onDonate();
      return;
    }
    if (total > balance) {
      setShowFundEmbed(true);
    } else {
      onDonate();
    }
  };

  const embedPortal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={() => setShowFundEmbed(false)}
    >
      <div
        className="bg-background rounded-2xl shadow-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
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
  );

  if (showFundEmbed && typeof document !== "undefined") {
    return ReactDOM.createPortal(embedPortal, document.body);
  }

  return (
    <>
      {showProfileModal && (
        <DonorProfileModal
          open
          onClose={() => setShowProfileModal(false)}
          walletAddress={wallet}
        />
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
          {error && <p className="text-destructive mb-2">{error.message}</p>}
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
