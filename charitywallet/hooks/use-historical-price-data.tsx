"use client";
import { useEffect, useState } from "react";

const coinIdMapping: { [symbol: string]: string } = {
  ETH: "ethereum",
  POL: "matic-network", // Adjust this mapping as needed.
};

export function useHistoricalPrice(
  tokenSymbol: string,
  timestamp: string,
  targetCurrency: string = "usd"
): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchHistoricalPrice() {
      // Convert the transaction timestamp to "dd-mm-yyyy" format for CoinGecko.
      const date = new Date(timestamp);
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const coinId = coinIdMapping[tokenSymbol];
      if (!coinId) {
        console.error("No coin id mapping for token:", tokenSymbol);
        return;
      }

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}`
        );
        const data = await res.json();
        if (
          data &&
          data.market_data &&
          data.market_data.current_price &&
          data.market_data.current_price[targetCurrency]
        ) {
          setPrice(data.market_data.current_price[targetCurrency]);
        } else {
          console.error(
            "Historical price data missing for",
            tokenSymbol,
            formattedDate,
            targetCurrency
          );
        }
      } catch (error) {
        console.error("Error fetching historical price:", error);
      }
    }
    fetchHistoricalPrice();
  }, [tokenSymbol, timestamp, targetCurrency]);

  return price;
}
