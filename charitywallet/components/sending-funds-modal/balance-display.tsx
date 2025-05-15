// components/BalanceDisplay.tsx
"use client";
import React from "react";

interface Props {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: Props) {
  return (
    <div className="mb-2">
      <label
        htmlFor="balance-display"
        className="block text-xs text-muted-foreground mb-1"
      >
        Your Balance&nbsp;(ETH)
      </label>
      <div
        id="balance-display"
        className="bg-muted p-2 rounded font-semibold text-base"
      >
        {balance != null ? balance.toFixed(4) : "Loading…"}
      </div>
    </div>
  );
}
