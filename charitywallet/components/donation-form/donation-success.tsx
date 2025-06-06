"use client";

import React, { useEffect, useState } from "react";
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
 * Donation‑success card with live countdown and ChatGPT‑style shimmer.
 * Requires `shimmer` keyframe in tailwind.config.ts.
 */
export const DonationSuccess: React.FC<DonationSuccessProps> = ({
  txHash,
  onReset,
}) => {
  const url = getTxExplorerLink(txHash);
  const [secondsLeft, setSecondsLeft] = useState(2);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const linkReady = secondsLeft === 0;

  return (
    <Card className="mx-auto w-full max-w-sm animate-fade-in">
      {/* STATUS */}
      <CardHeader className="text-center space-y-2">
        <CheckCircle className="mx-auto h-9 w-9 text-green-500" />
        <CardTitle>Donation submitted</CardTitle>
      </CardHeader>

      {/* ACTIONS */}
      <CardContent className="flex flex-col items-center space-y-2">
        {linkReady ? (
          <Button variant="link" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              View transaction
            </a>
          </Button>
        ) : (
          <p className="text-sm font-medium">
            <span className="relative inline-block overflow-hidden">
              <span className="animate-shimmer bg-gradient-to-l from-transparent via-white/60 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent">
                Transaction indexing… {secondsLeft}s
              </span>
            </span>
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          We&apos;ll email you once your transaction is confirmed.
        </p>
      </CardContent>

      {/* NEXT STEP */}
      <CardFooter className="mt-6 flex justify-center">
        <Button onClick={onReset}>Donate again</Button>
      </CardFooter>
    </Card>
  );
};
