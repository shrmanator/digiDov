import { useState, useEffect } from "react";
import { getWalletBalance } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

/**
 * Fetches and returns the ETH balance for a wallet on Sepolia.
 */
export function useWalletBalance(address?: string) {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;

    async function fetchBalance() {
      try {
        const res = await getWalletBalance({
          address: address as string,
          client: thirdwebClient,
          chain: sepolia,
        });
        setBalance(parseFloat(res.displayValue || "0"));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    }
    fetchBalance();
  }, [address]);

  return balance;
}
