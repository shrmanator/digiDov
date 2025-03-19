import { getHistoricalCryptoToFiatPrice } from "@/utils/get-historical-crytpo-price";
import { useEffect, useState } from "react";

/**
 * Custom hook to fetch the historical price of a cryptocurrency.
 *
 * @param chainId - The chain ID of the cryptocurrency (e.g., 1 for Ethereum).
 * @param timestamp - The timestamp of the transaction.
 * @param targetCurrency - The target fiat currency (e.g., 'usd'). Defaults to 'usd'.
 * @returns The historical price or null if not found.
 */
export function useHistoricalPrice(
  chainId: number,
  timestamp: string | number | Date,
  targetCurrency: string
): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function getPrice() {
      if (!chainId || !timestamp) return;

      const date = new Date(timestamp);
      const formattedDate = `${String(date.getUTCDate()).padStart(
        2,
        "0"
      )}-${String(date.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${date.getUTCFullYear()}`;

      const historicalPrice = await getHistoricalCryptoToFiatPrice(
        chainId,
        formattedDate,
        targetCurrency
      );

      setPrice(historicalPrice);
    }

    getPrice();
  }, [chainId, timestamp, targetCurrency]);

  return price;
}
