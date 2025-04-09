import { useState, useEffect } from "react";
import axios from "axios";

export const chainIdToCoingeckoId: Record<string, string> = {
  "0x1": "ethereum", // Ethereum Mainnet
  "0x89": "matic-network", // Polygon (MATIC)
};

export function getCoingeckoIdFromChainId(chainId: string): string | null {
  return chainIdToCoingeckoId[chainId] || null;
}

export function useStaticConversionRate(chainId: string, fiat = "usd") {
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chainId) return;

    // Convert chainId to hex if needed.
    const hexChainId = chainId.startsWith("0x")
      ? chainId
      : "0x" + parseInt(chainId, 10).toString(16);

    // Get the CoinGecko ID from the chain ID.
    const coingeckoId: string | null = getCoingeckoIdFromChainId(hexChainId);
    if (!coingeckoId) {
      setError(
        new Error(`No CoinGecko ID mapping found for chain ID: ${chainId}`)
      );
      return;
    }

    // Assign to a new variable that TypeScript knows is a string.
    const validCoingeckoId: string = coingeckoId;

    async function fetchConversionRate() {
      try {
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${validCoingeckoId}&vs_currencies=${fiat}`
        );
        if (!data[validCoingeckoId]) {
          throw new Error(
            `No data found for CoinGecko ID: ${validCoingeckoId}`
          );
        }
        const rate = data[validCoingeckoId][fiat];
        setConversionRate(rate);
      } catch (err) {
        console.error("Error fetching conversion rate:", err);
        setError(err as Error);
      }
    }

    fetchConversionRate();
  }, [chainId, fiat]);

  return { conversionRate, error };
}
