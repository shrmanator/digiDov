"use client";

interface Props {
  balance: number | null;
}

const BalanceDisplay = ({ balance }: Props) => (
  <div className="mb-2">
    <label className="block text-xs text-muted-foreground mb-1">
      Your Balance&nbsp;(ETH)
    </label>
    <div className="bg-muted p-2 rounded font-semibold text-base">
      {balance !== null ? balance.toFixed(4) : "Loading..."}
    </div>
  </div>
);

export default BalanceDisplay;
