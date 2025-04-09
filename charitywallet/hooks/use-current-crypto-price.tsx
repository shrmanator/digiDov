import { useState, useEffect } from "react";
import axios from "axios";

export function useStaticConversionRate(chainId: string, fiat = "usd") {
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chainId) return;

    async function fetchConversionRate() {
      try {
        const { data } = await axios.get(
          `/api/crypto-conversion-rate?chainId=${chainId}&fiat=${fiat}`
        );
        if (!data.conversionRate) {
          throw new Error(`No conversion rate found for chain ID: ${chainId}`);
        }
        setConversionRate(data.conversionRate);
      } catch (err) {
        console.error("Error fetching conversion rate:", err);
        setError(err as Error);
      }
    }
    fetchConversionRate();
  }, [chainId, fiat]);

  return { conversionRate, error };
}
