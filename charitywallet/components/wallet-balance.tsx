interface CombinedWalletBalanceProps {
  netWorth: string | null;
}

export default function CombinedWalletBalance({
  netWorth,
}: CombinedWalletBalanceProps) {
  return (
    <div className="text-sm font-mono mr-2.5">
      Total donations: ~$
      {netWorth ? parseFloat(netWorth).toFixed(2) : "N/A"} USD
    </div>
  );
}
