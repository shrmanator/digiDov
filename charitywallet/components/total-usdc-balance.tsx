"use client";

import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";
import React from "react";

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

  if (totalUsdc == null) {
    return <p className="text-sm">Loading total donations…</p>;
  }

  return (
    <div className="mb-2 text-sm">
      <span>Total donations ~ </span>
      <span className="font-normal">{totalUsdc.toFixed(4)} USD</span>
    </div>
  );
}
