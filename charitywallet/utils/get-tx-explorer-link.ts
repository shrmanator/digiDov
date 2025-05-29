// src/utils/get-explorer-url.ts

/**
 * Constructs an Etherscan URL for viewing a transaction on Ethereum.
 *
 * @param txHash Transaction hash
 * @returns URL to view the transaction on Etherscan
 */
export function getTxExplorerLink(txHash: string): string {
  if (!txHash) return "";
  return `https://etherscan.io/tx/${txHash}`;
}
