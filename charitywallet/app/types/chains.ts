
/**
 * Hex chain IDs → human-readable network names.
 */
export const CHAIN_NAMES: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  "0x89": "Polygon",
  "0x38": "BSC",
  // add others as needed…
};

/**
 * Given a hex chain ID, returns a friendly name (or fallback).
 */
export function getChainName(
  chainId: string | null | undefined
): string | null {
  if (!chainId) return null;
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}
