"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Web3 from "web3";
import SendWithFeeButton from "./send-with-fee";

interface DonationFormProps {
  charityWalletAddress: string; // Donation destination address (or contract)
}

export default function DonationForm({
  charityWalletAddress,
}: DonationFormProps) {
  const presetAmounts = [0.005, 0.01, 0.02, 0.05]; // Donation amounts in ETH
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const web3 = new Web3();

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  // Calculate the donation amount in wei as a BigInt.
  const donationAmountInWei = (() => {
    const donationAmount =
      selectedAmount !== null ? selectedAmount : parseFloat(customAmount);
    if (!donationAmount || donationAmount <= 0) return null;
    return BigInt(web3.utils.toWei(donationAmount.toString(), "ether"));
  })();

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Choose a Donation Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              onClick={() => handlePresetClick(amount)}
              className="flex-1"
            >
              {amount} ETH
            </Button>
          ))}
          <Input
            type="number"
            placeholder="Custom (ETH)"
            value={customAmount}
            onChange={handleCustomChange}
            className="w-24"
          />
        </div>
        {donationAmountInWei ? (
          <SendWithFeeButton
            donationValue={donationAmountInWei}
            recipientAddress={charityWalletAddress}
          />
        ) : (
          <Button disabled>Please enter a valid donation amount</Button>
        )}
      </CardContent>
    </Card>
  );
}
