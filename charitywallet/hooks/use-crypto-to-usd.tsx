"use client";

import { useEffect, useState } from "react";

// Custom hook to subscribe to live token price updates via Binance WebSocket
export function usePriceWebSocket(tokenSymbol: string): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    // Map the token symbol to Binance's ticker pair (assumes USDT pair for USD pricing)
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

  return price;
}
