"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DonationFormProps {
  charityId: string;
  donorAddress: string;
}

export default function DonationForm({
  charityId,
  donorAddress,
}: DonationFormProps) {
  const presetAmounts = [10, 20, 50, 100]; // donation amounts, e.g., in dollars
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // clear custom input if preset selected
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null); // clear preset if custom input used
  };

  const handleDonate = () => {
    const donation =
      selectedAmount !== null ? selectedAmount : parseFloat(customAmount);
    if (!donation || donation <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    // Here, you'd integrate with your donation logic (e.g., call a function to handle the transaction via Thirdweb)
    console.log(
      `Donating ${donation} to charity ${charityId} from donor ${donorAddress}`
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Choose a Donation Amount</h3>
        <div className="flex gap-2 mt-2">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              onClick={() => handlePresetClick(amount)}
            >
              ${amount}
            </Button>
          ))}
          <Input
            type="number"
            placeholder="Custom"
            value={customAmount}
            onChange={handleCustomChange}
            className="w-24"
          />
        </div>
      </div>
      <Button onClick={handleDonate}>Donate Now</Button>
    </div>
  );
}
