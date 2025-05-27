import { useState, useEffect } from "react";
import { getWalletBalance } from "thirdweb/wallets";
import {
  ethereum as ethereumChain,
  polygon as polygonChain,
} from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

const USDC_ETH_MAINNET = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDC_POLY_BRIDGED = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

export type ChainOption = "ethereum" | "polygon" | "all";

/**
 * Fetches USDC balances on Ethereum & Polygon and returns:
 * - if chain="ethereum": just ETH USDC
 * - if chain="polygon": just POLY USDC
 * - if chain="all" (default): ETH + POLY sum
 */
export function useTotalUsdcBalance(
  address?: string,
  chain: ChainOption = "all"
): number | null {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    const addr = address;

    async function fetchBalances() {
      try {
        // always fetch both under the hood
        const [ethRes, polyRes] = await Promise.all([
          getWalletBalance({
            address: addr,
            client: thirdwebClient,
            chain: ethereumChain,
            tokenAddress: USDC_ETH_MAINNET,
          }),
          getWalletBalance({
            address: addr,
            client: thirdwebClient,
            chain: polygonChain,
            tokenAddress: USDC_POLY_BRIDGED,
          }),
        ]);

        const ethUsdc = parseFloat(ethRes.displayValue || "0");
        const polyUsdc = parseFloat(polyRes.displayValue || "0");

        let result: number;
        if (chain === "ethereum") {
          result = ethUsdc;
        } else if (chain === "polygon") {
          result = polyUsdc;
        } else {
          result = ethUsdc + polyUsdc;
        }

        setBalance(result);
      } catch (err) {
        console.error("[USDC] fetch error:", err);
        setBalance(null);
      }
    }

    fetchBalances();
  }, [address, chain]);

  return balance;
}
