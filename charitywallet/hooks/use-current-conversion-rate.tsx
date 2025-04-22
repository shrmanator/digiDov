import useSWR from "swr";

interface ConversionResponse {
  conversionRate: number;
}

const fetcher = async (url: string): Promise<ConversionResponse> => {
  console.debug("[useConversionRate] fetching", url);
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    console.error("[useConversionRate] fetch error:", text);
    throw new Error(`Failed to fetch conversion rate: ${text}`);
  }
  const json = JSON.parse(text);
  console.debug("[useConversionRate] got response", json);
  return json;
};

export function useConversionRate(
  chainId: string,
  fiat = "usd"
): {
  conversionRate: number | null;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
} {
  // build the exact URL as your API expects
  const url =
    chainId && fiat
      ? `/api/crypto-conversion-rate?chainId=${chainId}&fiat=${fiat}`
      : null;

  const {
    data,
    error,
    isLoading,
  } = useSWR<ConversionResponse, Error>(url, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 1,
  });

  // Debug log for hook state
  console.log("[useConversionRate] hook state:", {
    url,
    conversionRate: data?.conversionRate,
    isLoading,
    isError: Boolean(error),
    error,
  });

  return {
    conversionRate: data?.conversionRate ?? null,
    isLoading,
    isError: Boolean(error),
    error: error ?? undefined,
  };
}
