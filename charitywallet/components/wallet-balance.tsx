"use client";
import { useEffect, useState } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { ethereum, polygon } from "thirdweb/chains";
import { Skeleton } from "@/components/ui/skeleton";

export default function CombinedWalletBalance() {
  const account = useActiveAccount();
  const address = account?.address;

  // State for conversion rates (in USD)
  const [ethUsdRate, setEthUsdRate] = useState(1700); // default: 1 ETH = $1700
  const [maticUsdRate, setMaticUsdRate] = useState(1.2); // default: 1 MATIC = $1.20
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd"
        );
        const data = await res.json();
        if (data.ethereum?.usd) {
          setEthUsdRate(data.ethereum.usd);
        }
        if (data["matic-network"]?.usd) {
          setMaticUsdRate(data["matic-network"].usd);
        }
      } catch (err) {
        console.error("Failed to fetch conversion rates:", err);
      } finally {
        setRatesLoading(false);
      }
    }
    fetchRates();
  }, []);

  //   // If no wallet is connected, show a skeleton
  //   if (!address) {
  //     return (
  //       <div className="text-sm font-mono mr-2.5">
  //         <Skeleton className="inline-block h-5 w-[140px]" />
  //       </div>
  //     );
  //   }

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

  // Show a skeleton if any data is loading
  if (ethLoading || polyLoading || ratesLoading) {
    return (
      <div className="text-sm font-mono mr-2.5">
        <Skeleton className="inline-block h-5 w-[140px]" />
      </div>
    );
  }

  // Parse balance strings to numbers
  const ethVal = parseFloat(ethBalance?.displayValue || "0");
  const polyVal = parseFloat(polyBalance?.displayValue || "0");

  // Convert each balance to USD using the fetched conversion rates
  const ethUsd = ethVal * ethUsdRate;
  const polyUsd = polyVal * maticUsdRate;
  const totalUsd = ethUsd + polyUsd;

  return (
    <div className="text-sm font-mono mr-2.5">
      Total: ~${totalUsd.toFixed(2)} USD
    </div>
  );
}
