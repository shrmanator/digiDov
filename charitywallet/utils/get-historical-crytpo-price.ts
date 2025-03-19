import axios from "axios";
import { getCoingeckoIdFromChainId } from "./get-coingecko-id-from-chain-id";

/**
 * Checks if a string is already in 'dd-mm-yyyy' format.
 */
function isCoinGeckoDateFormat(date: string): boolean {
  return /^\d{2}-\d{2}-\d{4}$/.test(date);
}

/**
 * Converts an ISO 8601 timestamp to the CoinGecko required 'dd-mm-yyyy' format.
 */
function convertToCoinGeckoDate(dateString: string): string {
  if (isCoinGeckoDateFormat(dateString)) {
    return dateString; // Already in correct format, return as is
  }

  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Fetches the historical fiat value of a cryptocurrency on a specific date.
 *
 * @param chainId - The blockchain chain ID in hexadecimal format (e.g., '0x1' for Ethereum, '0x89' for Polygon).
 * @param dateString - The date, either in 'dd-mm-yyyy' or ISO format.
 * @param targetCurrency - The target fiat currency (e.g., 'usd', 'eur'). Defaults to 'usd'.
 * @returns The historical price of the cryptocurrency in the specified fiat currency, or null if not found.
 */
export async function getHistoricalCryptoToFiatPrice(
  chainId: string,
  dateString: string,
  targetCurrency: string = "usd"
): Promise<number | null> {
  // Ensure the date is in the correct format
  const date = convertToCoinGeckoDate(dateString);

  // Get the corresponding CoinGecko token ID
  const tokenId = getCoingeckoIdFromChainId(chainId);
  if (!tokenId) {
    console.error(`Unsupported chainId: ${chainId}`);
    return null;
  }

  const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${date}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (
      data &&
      data.market_data &&
      data.market_data.current_price &&
      data.market_data.current_price[targetCurrency]
    ) {
      return data.market_data.current_price[targetCurrency];
    } else {
      console.error(
        `Historical price data missing for ${tokenId} on ${date} in ${targetCurrency}`
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching historical price:", error);
    return null;
  }
}
