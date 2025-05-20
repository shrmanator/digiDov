import axios from "axios";

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
    return dateString; // Already in the correct format
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
 * @param chainId - The blockchain chain ID in hexadecimal format (e.g., '0x1' for Ethereum).
 * @param dateString - The date, either in 'dd-mm-yyyy' or ISO format.
 * @param targetCurrency - The target fiat currency (e.g., 'usd', 'eur'). Defaults to 'usd'.
 * @returns The historical price of the cryptocurrency in the specified fiat currency, or null if not found.
 */
export async function getHistoricalCryptoToFiatPrice(
  chainId: string,
  dateString: string,
  targetCurrency: string = "usd"
): Promise<number | null> {
  // Ensure the date is in the correct 'dd-mm-yyyy' format
  const date = convertToCoinGeckoDate(dateString);

  // Internal API endpoint (ensure this matches your app route file path)
  const url = `/api/crypto-historical-price?chainId=${chainId}&date=${date}&targetCurrency=${targetCurrency}`;

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
        `Historical price data missing for chain ${chainId} on ${date} in ${targetCurrency}`
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching historical price:", error);
    return null;
  }
}
