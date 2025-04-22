import useSWR, { SWRResponse } from "swr";

interface ConversionResponse {
  conversionRate: number;
}

const fetcher = (url: string): Promise<ConversionResponse> =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch conversion rate: ${text}`);
    }
    return res.json();
  });

export function useConversionRate(
  chainId: string,
  fiat = "usd"
): {
  conversionRate: number | null;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
} {
  // use a tuple key to avoid accidental cache collisions
  const key = chainId
    ? (["/api/crypto-conversion-rate", chainId, fiat] as const)
    : null;

  const { data, error, isValidating }: SWRResponse<ConversionResponse, Error> =
    useSWR(
      key,
      () =>
        fetcher(`/api/crypto-conversion-rate?chainId=${chainId}&fiat=${fiat}`),
      {
        refreshInterval: 30_000,
        revalidateOnFocus: false,
        shouldRetryOnError: true, // retry once by default
        errorRetryCount: 1,
      }
    );

  return {
    conversionRate: data?.conversionRate ?? null,
    isLoading: isValidating,
    isError: Boolean(error),
    error: error ?? undefined,
  };
}
