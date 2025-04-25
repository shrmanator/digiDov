/**
 * Maps blockchain network chain IDs to their corresponding CoinGecko token IDs.
 */
export const chainIdToCoingeckoId: Record<string, string> = {
  "0x1": "ethereum", // Ethereum Mainnet
  "0x89": "polygon-ecosystem-token", // Polygon (formerly Matic)
};

/**
 * Retrieves the CoinGecko ID for a given blockchain chain ID.
 *
 * @param chainId - The blockchain chain ID in hexadecimal format (e.g., "0x1" for Ethereum, "0x89" for Polygon).
 * @returns The corresponding CoinGecko ID, or null if not found. Adding for commit
 */
export function getCoingeckoIdFromChainId(chainId: string): string | null {
  return chainIdToCoingeckoId[chainId] || null;
}
