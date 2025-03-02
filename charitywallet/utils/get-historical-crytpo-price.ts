import axios from "axios";

/**
 * Fetches the historical fiat value of a cryptocurrency on a specific date.
 *
 * @param tokenId - The CoinGecko ID of the cryptocurrency (e.g., 'ethereum').
 * @param date - The date in 'dd-mm-yyyy' format.
 * @param targetCurrency - The target fiat currency (e.g., 'usd', 'eur'). Defaults to 'usd'.
 * @returns The historical price of the cryptocurrency in the specified fiat currency, or null if not found.
 */
export async function getHistoricalCryptoToFiatPrice(
  tokenId: string,
  date: string,
  targetCurrency: string
): Promise<number | null> {
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
