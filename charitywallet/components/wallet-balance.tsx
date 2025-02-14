"use client";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { ethereum, polygon } from "thirdweb/chains";
import { Skeleton } from "@/components/ui/skeleton";

// Example conversion rates (in USD)
// In a real app, you might fetch these rates from an API.
const ETH_USD_RATE = 1700; // 1 ETH = $1700 USD (example)
const MATIC_USD_RATE = 1.2; // 1 MATIC = $1.20 USD (example)

export default function CombinedWalletBalance() {
  const account = useActiveAccount();
  const address = account?.address;

  // Get balance for Ethereum
  const { data: ethBalance, isLoading: ethLoading } = useWalletBalance({
    client,
    address,
    chain: ethereum,
  });

  // Get balance for Polygon
  const { data: polyBalance, isLoading: polyLoading } = useWalletBalance({
    client,
    address,
    chain: polygon,
  });

//   if (!address) {
//     return <div>No wallet connected</div>;
//   }

  if (ethLoading || polyLoading) {
    return (
      <p className="text-sm font-mono mr-2.5">
        <Skeleton className="inline-block h-5 w-[140px]" />
      </p>
    );
  }

  // Parse balance strings to numbers
  const ethVal = parseFloat(ethBalance?.displayValue || "0");
  const polyVal = parseFloat(polyBalance?.displayValue || "0");

  // Convert each balance to USD using the provided conversion rates
  const ethUsd = ethVal * ETH_USD_RATE;
  const polyUsd = polyVal * MATIC_USD_RATE;
  const totalUsd = ethUsd + polyUsd;

  return (
    <div>
      <p className="text-sm font-mono mr-2.5">
        Total: ~${totalUsd.toFixed(2)} USD
      </p>
    </div>
  );
}
