/**
 * Multi-chain token to fiat currency converter utility for Next.js App Router
 * Supports Ethereum, Polygon, and other EVM-compatible chains
 */
import Web3 from "web3";
import { getCoingeckoIdFromChainId } from "./get-coingecko-id-from-chain-id";

const web3 = new Web3();

/**
 * Formats Unix timestamp to CoinGecko's required date format (dd-mm-yyyy)
 */
function formatDateForCoinGecko(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Converts Wei amount to target fiat currency based on historical rate
 */
export async function convertWeiToFiat(
  weiAmount: string,
  timestamp: number,
  targetCurrency: string,
  chainId: string
): Promise<number> {
  // Input validation
  if (!weiAmount) throw new Error("weiAmount must be provided");
  if (!timestamp) throw new Error("timestamp must be provided");
  if (!chainId) throw new Error("chainId must be provided");

  const currency = targetCurrency.toLowerCase();
  const tokenId = getCoingeckoIdFromChainId(chainId);

  if (!tokenId) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  // Convert wei to ether/matic (both use same decimals)
  const tokenAmount = parseFloat(web3.utils.fromWei(weiAmount, "ether"));
  const formattedDate = formatDateForCoinGecko(timestamp);

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${formattedDate}&localization=false`;

    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.market_data?.current_price) {
      throw new Error(`No price data for ${tokenId} on ${formattedDate}`);
    }

    if (!data.market_data.current_price[currency]) {
      throw new Error(`Price not available in ${currency}`);
    }

    const price = data.market_data.current_price[currency];
    return tokenAmount * price;
  } catch (error) {
    console.error("Price conversion error:", error);
    throw new Error(
      `Failed to convert to ${currency}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
