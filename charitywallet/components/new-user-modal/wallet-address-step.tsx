"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WalletAddressStepProps {
  walletAddress: string;
  onFinish: () => void;
}

export function WalletAddressStep({
  walletAddress,
  onFinish,
}: WalletAddressStepProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Organization Setup Complete</DialogTitle>
        <DialogDescription>
          This is your wallet address:{" "}
          <span className="font-bold">{walletAddress}</span>
          <br />
          Please add this to your organization site.
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end">
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </div>
  );
}
