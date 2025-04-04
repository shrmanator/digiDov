"use client";

import { useEffect, useState } from "react";

/**
 * A hook that subscribes to live token price updates via Binance WebSocket (returns prices in USD)
 * and converts the price to CAD using a live conversion rate from open.er-api.com.
 *
 * @param tokenSymbol - The token symbol (e.g. "eth" for Ethereum)
 * @param targetCurrency - Either "USD" or "CAD" (defaults to "USD")
 * @returns The current price in the chosen currency, or null if not available.
 */
export function usePriceWebSocket(
  tokenSymbol: string,
  targetCurrency: "USD" | "CAD" = "USD"
): number | null {
  const [price, setPrice] = useState<number | null>(null);
  const [usdToCadRate, setUsdToCadRate] = useState<number>(1); // fallback value

  // Fetch live USD to CAD conversion rate from open.er-api.com
  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        console.log("the data");
        if (
          data &&
          data.result === "success" &&
          data.rates &&
          typeof data.rates.CAD === "number"
        ) {
          setUsdToCadRate(data.rates.CAD);
        } else {
          console.error("Unexpected conversion API response structure:", data);
          setUsdToCadRate(1.3);
        }
      } catch (error) {
        console.error("Error fetching USD to CAD conversion rate:", error);
        setUsdToCadRate(1.3);
      }
    };

    fetchConversionRate();
  }, []);

  useEffect(() => {
    const lowerSymbol = tokenSymbol.toLowerCase();
    const pair = `${lowerSymbol}usdt`; // e.g. "ethusdt" for ETH
    const wsUrl = `wss://stream.binance.com:9443/ws/${pair}@ticker`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Connected to Binance WebSocket:", wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Binance's ticker stream returns a JSON with field "c" representing the current price.
        if (data && data.c) {
          const currentPrice = parseFloat(data.c);
          if (!isNaN(currentPrice)) {
            setPrice(currentPrice);
          }
        }
      } catch (error) {
        console.error("Error parsing Binance WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Binance WebSocket error:", error);
    };

    // Cleanup when component unmounts or tokenSymbol changes
    return () => {
      socket.close();
    };
  }, [tokenSymbol]);

  if (price === null) return null;
  return targetCurrency === "CAD" ? price * usdToCadRate : price;
}
