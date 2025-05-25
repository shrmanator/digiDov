"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";

/**
 * TotalUsdcBalance
 * Fetches and displays the total USDC donations (sum across Ethereum & Polygon).
 * Usage: <TotalUsdcBalance address="0x..." />
 */
export default function TotalUsdcBalance({
  address,
}: {
  /** EVM wallet address to fetch total USDC for */
  address: string;
}) {
  const totalUsdc = useTotalUsdcBalance(address);

  // Show a shadcn-ui skeleton while loading
  if (totalUsdc == null) {
    return (
      <div className="mb-2 text-sm inline-flex space-x-2 items-center">
        {/* Skeleton for "Total donations ~" label */}
        <Skeleton className="h-4 w-32" />
        {/* Skeleton for amount */}
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="mb-2 text-sm inline-flex space-x-1 items-center">
      <span>Total donations ~</span>
      <span className="font-normal">{totalUsdc.toFixed(4)} USD</span>
    </div>
  );
}
