// components/donation-form/donation-success.tsx
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExplorerLink } from "./explorer-link";

interface DonationSuccessProps {
  amountUSD: number;
  tokenFloat: number;
  txHash: string;
  onReset: () => void;
}

export const DonationSuccess: React.FC<DonationSuccessProps> = ({
  amountUSD,
  tokenFloat,
  txHash,
  onReset,
}) => {
  return (
    <Card className="mx-auto w-full max-w-md border bg-card text-card-foreground animate-fade-in-up">
      <CardHeader className="text-center space-y-2">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <CardTitle className="text-2xl">Thank you!</CardTitle>
      </CardHeader>

      <CardContent className="text-center">
        <p>
          You donated <strong>${amountUSD.toFixed(2)}</strong> (~
          {tokenFloat.toFixed(3)} POL).
        </p>
        <div className="mt-4">
          <ExplorerLink txHash={txHash} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          Make another donation
        </Button>
      </CardFooter>
    </Card>
  );
};
