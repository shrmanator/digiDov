// src/utils/get-explorer-url.ts

/**
 * Constructs a Blockscan URL for viewing a transaction on any chain.
 * Blockscan supports multiple networks in one interface.
 */
export function getTxExplorerLink(txHash: string): string {
  if (!txHash) return "";
  return `https://blockscan.com/tx/${txHash}`;
}
