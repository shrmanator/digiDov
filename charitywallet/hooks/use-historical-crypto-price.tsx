import { getHistoricalPrice } from "@/utils/get-historical-crytpo-price";
import { useEffect, useState } from "react";

/**
 * Custom hook to fetch the historical price of a cryptocurrency.
 *
 * @param tokenId - The CoinGecko ID of the cryptocurrency (e.g., 'ethereum').
 * @param timestamp - The timestamp of the transaction.
 * @param targetCurrency - The target fiat currency (e.g., 'usd'). Defaults to 'usd'.
 * @returns The historical price or null if not found.
 */
export function useHistoricalPrice(
  tokenId: string,
  timestamp: string | number | Date,
  targetCurrency: string
): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function getPrice() {
      if (!tokenId || !timestamp) return;

      const date = new Date(timestamp);
      const formattedDate = `${String(date.getUTCDate()).padStart(
        2,
        "0"
      )}-${String(date.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${date.getUTCFullYear()}`;

      const historicalPrice = await getHistoricalPrice(
        tokenId,
        formattedDate,
        targetCurrency
      );

      setPrice(historicalPrice);
    }

    getPrice();
  }, [tokenId, timestamp, targetCurrency]);

  return price;
}
