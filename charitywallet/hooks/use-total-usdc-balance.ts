import { useState, useEffect } from "react";
import { getWalletBalance } from "thirdweb/wallets";
import {
  ethereum as ethereumChain,
  polygon as polygonChain,
} from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

const USDC_ETH_MAINNET = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDC_POLY_BRIDGED = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

export function useTotalUsdcBalance(address?: string) {
  const [totalUsdc, setTotalUsdc] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;

    const addr = address;

    async function fetchBalances() {
      try {
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
        setTotalUsdc(ethUsdc + polyUsdc);
      } catch (err) {
        console.error("[USDC] fetch error:", err);
      }
    }

    fetchBalances();
  }, [address]);

  return totalUsdc;
}
