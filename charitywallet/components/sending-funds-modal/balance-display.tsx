"use client";
import React from "react";

interface Props {
  balance: number | null;
}

export default function BalanceDisplay({ balance }: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">Your Balance:</span>
      <span id="balance-display" className="mt-1 text-lg font-semibold">
        {balance != null ? (
          `$${balance.toFixed(4)} USD`
        ) : (
          <span className="opacity-50">Loading…</span>
        )}
      </span>
    </div>
  );
}
