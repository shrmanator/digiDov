import axios from "axios";
import { getCoingeckoIdFromChainId } from "./get-coingecko-id-from-chain-id";

/**
 * Fetches the historical fiat value of a cryptocurrency on a specific date.
 *
 * @param chainId - The blockchain chain ID (e.g., 1 for Ethereum, 137 for Polygon).
 * @param date - The date in 'dd-mm-yyyy' format.
 * @param targetCurrency - The target fiat currency (e.g., 'usd', 'eur'). Defaults to 'usd'.
 * @returns The historical price of the cryptocurrency in the specified fiat currency, or null if not found.
 */
export async function getHistoricalCryptoToFiatPrice(
  chainId: number,
  date: string,
  targetCurrency: string = "usd"
): Promise<number | null> {
  const coingeckoId = getCoingeckoIdFromChainId(chainId);

  if (!coingeckoId) {
    console.error(`Unknown chain ID: ${chainId}`);
    return null;
  }

  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${date}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data?.market_data?.current_price?.[targetCurrency]) {
      return data.market_data.current_price[targetCurrency];
    } else {
      console.error(
        `Historical price data missing for chain ID ${chainId} (${coingeckoId}) on ${date} in ${targetCurrency}`
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching historical price:", error);
    return null;
  }
}
