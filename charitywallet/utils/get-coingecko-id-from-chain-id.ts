/**
 * Maps blockchain network chain IDs to their corresponding CoinGecko token IDs.
 */
export const chainIdToCoingeckoId: Record<number, string> = {
  1: "ethereum", // Ethereum Mainnet
  137: "polygon-ecosystem-token", // Polygon (formerly Matic)
};

/**
 * Retrieves the CoinGecko ID for a given blockchain chain ID.
 *
 * @param chainId - The blockchain chain ID (e.g., 1 for Ethereum, 137 for Polygon).
 * @returns The corresponding CoinGecko ID, or null if not found.
 */
export function getCoingeckoIdFromChainId(chainId: number): string | null {
  return chainIdToCoingeckoId[chainId] || null;
}
