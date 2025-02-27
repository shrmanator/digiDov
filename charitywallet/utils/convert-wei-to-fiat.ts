import Web3 from "web3";
const web3 = new Web3();

// Map of supported chain IDs to their respective token identifiers
const CHAIN_TOKEN_MAP: Record<string, string> = {
  "0x1": "ethereum",
  "0x89": "matic-network",
};

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

/**
 * Converts a value in Wei to fiat currency using historical price data from CoinGecko.
 *
 * @param weiAmount - The amount in Wei as a string
 * @param timestamp - The UNIX timestamp (in seconds) at which to fetch the historical price
 * @param targetCurrency - The fiat currency to convert to (default: "cad")
 * @param chainId - The chain identifier (e.g., "0x1" for Ethereum, "0x89" for Polygon)
 * @returns The fiat value as a number
 * @throws Will throw an error if chainId is unsupported or if the API request fails
 */
export async function convertWeiToFiat(
  weiAmount: string,
  timestamp: number,
  targetCurrency: string,
  chainId: string
): Promise<number> {
  // Validate inputs
  if (!weiAmount) throw new Error("weiAmount must be provided");
  if (!timestamp) throw new Error("timestamp must be provided");
  if (!chainId) throw new Error("chainId must be provided for conversion");

  // Normalize targetCurrency
  const normalizedCurrency = targetCurrency.toLowerCase();

  // Get token ID for the specified chain
  const tokenId = CHAIN_TOKEN_MAP[chainId];
  if (!tokenId) {
    throw new Error(
      `Unsupported chainId: ${chainId}. Supported chains are: ${Object.keys(
        CHAIN_TOKEN_MAP
      ).join(", ")}`
    );
  }

  // Convert Wei to Ether (or native token unit)
  const etherAmount = parseFloat(web3.utils.fromWei(weiAmount, "ether"));

  // Format the date for CoinGecko API
  const formattedDate = formatDateForCoinGecko(timestamp);

  try {
    // Fetch historical price data from CoinGecko
    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${formattedDate}&localization=false`;
    const response = await fetch(url);

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CoinGecko API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Validate response data structure
    if (!data?.market_data?.current_price?.[normalizedCurrency]) {
      throw new Error(
        `Historical price data not available for ${normalizedCurrency} on ${formattedDate}`
      );
    }

    const price = data.market_data.current_price[normalizedCurrency];
    console.log(`Historical price (${normalizedCurrency}):`, price);

    return etherAmount * price;
  } catch (error) {
    // Enhance the error with context
    if (error instanceof Error) {
      throw new Error(
        `Failed to convert Wei to ${normalizedCurrency}: ${error.message}`
      );
    }
    throw error;
  }
}
