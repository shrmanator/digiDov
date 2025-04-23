"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getTxExplorerLink } from "@/utils/get-tx-explorer-link";

interface DonationSuccessProps {
  txHash: string;
  onReset: () => void;
}

/**
 * Donation‑success card – simplified. Shows explorer link immediately with a
 * note that indexing may take ~30 s.
 */
export const DonationSuccess: React.FC<DonationSuccessProps> = ({
  txHash,
  onReset,
}) => {
  const url = getTxExplorerLink(txHash);

  return (
    <Card className="mx-auto w-full max-w-sm animate-fade-in">
      {/* STATUS */}
      <CardHeader className="text-center space-y-2">
        <CheckCircle className="mx-auto h-9 w-9 text-green-500" />
        <CardTitle>Donation submitted</CardTitle>
      </CardHeader>

      {/* ACTIONS */}
      <CardContent className="flex flex-col items-center space-y-2">
        {url && (
          <Button variant="link" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              View transaction (may take up to 30 s to appear)
            </a>
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center">
          We’ll email your tax receipt once the transaction is confirmed on the
          blockchain.
        </p>
      </CardContent>

      {/* NEXT STEP */}
      <CardFooter className="mt-6 flex justify-center">
        <Button onClick={onReset}>Donate again</Button>
      </CardFooter>
    </Card>
  );
};
