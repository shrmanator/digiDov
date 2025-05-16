export interface PayTrieTransaction {
  /** Unique ID for the PayTrie order */
  transactionId: string;
  /** Locked-in CAD → USD exchange rate */
  exchangeRate: string;
  /** On-chain address to send USDC-POLY deposit to */
  depositAddress: string;
  /** Exact amount of USDC-POLY (decimal) to send on-chain */
  depositAmount: number;
}
