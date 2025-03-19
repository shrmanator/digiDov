import Web3 from "web3";
import { getCoingeckoIdFromChainId } from "./get-coingecko-id-from-chain-id";

const web3 = new Web3();

/**
 * Formats a Unix timestamp to the date format required by CoinGecko (dd-mm-yyyy).
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
function formatDateForCoinGecko(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

export async function convertWeiToFiat(
  weiAmount: string,
  timestamp: number,
  targetCurrency: string,
  chainId: string
): Promise<number> {
  if (!weiAmount) throw new Error("weiAmount must be provided");
  if (!timestamp) throw new Error("timestamp must be provided");
  if (!chainId) throw new Error("chainId must be provided for conversion");

  const normalizedCurrency = targetCurrency.toLowerCase();

  // Use the utility function to get the CoinGecko ID
  const tokenId = getCoingeckoIdFromChainId(chainId);
  if (!tokenId) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const etherAmount = parseFloat(web3.utils.fromWei(weiAmount, "ether"));
  const formattedDate = formatDateForCoinGecko(timestamp);

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${formattedDate}&localization=false`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CoinGecko API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data?.market_data?.current_price?.[normalizedCurrency]) {
      throw new Error(
        `Historical price data not available for ${normalizedCurrency} on ${formattedDate}`
      );
    }

    const price = data.market_data.current_price[normalizedCurrency];
    console.log(`Historical price (${normalizedCurrency}):`, price);

    return etherAmount * price;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to convert Wei to ${normalizedCurrency}: ${error.message}`
      );
    }
    throw error;
  }
}
