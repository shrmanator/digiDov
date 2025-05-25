import { useState, useEffect } from "react";
import { getWalletBalance } from "thirdweb/wallets";
import {
  ethereum as ethereumChain,
  polygon as polygonChain,
} from "thirdweb/chains";
import { client as thirdwebClient } from "@/lib/thirdwebClient";

/* USDC contract addresses (all lower‑case) */
const USDC_ETH_MAINNET = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // Ethereum USDC :contentReference[oaicite:0]{index=0}
const USDC_POLY_NATIVE = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"; // Polygon native USDC :contentReference[oaicite:1]{index=1}
const USDC_POLY_BRIDGED = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // Polygon bridged USDC.e :contentReference[oaicite:2]{index=2}

export function useTotalUsdcBalance(address?: string) {
  const [totalUsdc, setTotalUsdc] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    const addr = address; // narrow to plain string

    async function fetchBalances() {
      try {
        const [ethRes, polyNatRes, polyBridRes] = await Promise.all([
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
            tokenAddress: USDC_POLY_NATIVE,
          }),
          getWalletBalance({
            address: addr,
            client: thirdwebClient,
            chain: polygonChain,
            tokenAddress: USDC_POLY_BRIDGED,
          }),
        ]);
        const ethUsdc = parseFloat(ethRes.displayValue || "0");
        const polyNat = parseFloat(polyNatRes.displayValue || "0");
        const polyBrid = parseFloat(polyBridRes.displayValue || "0");
        const polygon = polyNat + polyBrid;
        setTotalUsdc(ethUsdc + polygon);
      } catch (err) {
        console.error("[USDC] fetch error:", err);
      }
    }

    fetchBalances();
  }, [address]);
  console.log("[USDC] total balance:", totalUsdc);
  return totalUsdc;
}
