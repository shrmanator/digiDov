"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useWalletBalance } from "thirdweb/react";
import { ethereum, polygon } from "thirdweb/chains";

export type SupportedChain = "ethereum" | "polygon";

const COIN_IDS: Record<SupportedChain, string> = {
  ethereum: "ethereum",
  polygon: "matic-network",
};

interface CombinedWalletBalanceProps {
  initialPriceData: any;
  chains?: SupportedChain[];
  address: string;
  client: any;
  currency?: string;
}

export default function CombinedWalletBalance({
  initialPriceData,
  chains = ["ethereum", "polygon"],
  address,
  client,
  currency = "usd",
}: CombinedWalletBalanceProps) {
  const [calculatedNetWorth, setCalculatedNetWorth] = useState<number | null>(
    null
  );
  const [priceData, setPriceData] = useState(initialPriceData);

  // Fetch wallet balances for each chain
  const ethBalance = useWalletBalance({
    chain: ethereum,
    address,
    client,
  });

  const polygonBalance = useWalletBalance({
    chain: polygon,
    address,
    client,
  });

  // Map chain names to their respective balance data
  const balanceMap = {
    ethereum: ethBalance,
    polygon: polygonBalance,
  };

  // Create an array of requested balances
  const requestedBalances = useMemo(
    () =>
      chains.map((chain) => ({
        chain,
        balanceData: balanceMap[chain],
      })),
    [chains, ethBalance, polygonBalance]
  );

  // Check loading and error states
  const isLoading = requestedBalances.some(
    (item) => item.balanceData.isLoading
  );
  const isError = requestedBalances.some((item) => item.balanceData.isError);

  // Calculate total net worth using the provided price data
  useEffect(() => {
    const calculateTotalValue = () => {
      if (isLoading || isError) return;

      const total = requestedBalances.reduce((sum, item) => {
        const { chain, balanceData } = item;
        const balance = parseFloat(balanceData.data?.displayValue || "0");
        const price = priceData[COIN_IDS[chain]]?.[currency] || 0;
        return sum + balance * price;
      }, 0);

      setCalculatedNetWorth(total);
    };

    calculateTotalValue();
  }, [chains, requestedBalances, isLoading, isError, currency, priceData]);
  console.log("calculatedNetWorth", calculatedNetWorth);
  return (
    <div className="text-sm font-mono mr-2.5">
      Total donations: ~
      {calculatedNetWorth !== null ? calculatedNetWorth.toFixed(4) : "N/A"}{" "}
      {currency.toUpperCase()}
    </div>
  );
}
