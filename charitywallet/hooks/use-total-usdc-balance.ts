import { useState, useEffect } from "react";
import { getWalletBalance } from "thirdweb/wallets";
import { ethereum as ethereumChain } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

/**
 * Fetches USDC balance on Ethereum mainnet.
 */
export function useTotalUsdcBalance(address?: string): number | null {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    const addr = address;

    async function fetchBalance() {
      try {
        const ethRes = await getWalletBalance({
          address: addr,
          client: thirdwebClient,
          chain: ethereumChain,
          tokenAddress: process.env.NEXT_PUBLIC_ETH_USDC_ADDRESS,
        });

        const ethUsdc = parseFloat(ethRes.displayValue || "0");
        setBalance(ethUsdc);
      } catch (err) {
        console.error("[USDC] fetch error:", err);
        setBalance(null);
      }
    }

    fetchBalance();
  }, [address]);

  return balance;
}
