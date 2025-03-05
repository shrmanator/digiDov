/**
 * Converts a value from wei (the smallest unit of Ether or MATIC) to Ether or MATIC.
 *
 * @param wei - The amount in wei as a bigint.
 * @returns The equivalent amount in Ether or MATIC as a number.
 */
export function weiToEvm(wei: bigint): number {
  const weiInEvm = BigInt("1000000000000000000"); // 10^18
  return Number(wei) / Number(weiInEvm);
}
