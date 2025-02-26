import Moralis from "moralis";

// Basic transaction shape returned by Moralis
interface Transaction {
  hash: string;
  value: string;
  from_address: string;
  to_address: string;
  block_number: string;
  block_timestamp: string;
}

// Extended interface with transaction type and chain info
export interface TransactionWithType extends Transaction {
  type: "Received" | "Sent";
  chain: "0x1" | "0x89";
}

/**
 * Fetch transactions from Ethereum (0x1) and Polygon (0x89), filtered by type.
 * @param walletAddress - The wallet address to fetch transactions for.
 * @param filter - Can be "sent", "received", or "all".
 * @returns A filtered list of transactions.
 */
export async function fetchTransactions(
  walletAddress: string,
  filter: "sent" | "received" | "all" = "all"
): Promise<TransactionWithType[]> {
  try {
    const chains = ["0x1", "0x89"] as const;

    // Fetch transactions for each chain in parallel
    const results = await Promise.allSettled(
      chains.map((chain) =>
        Moralis.EvmApi.wallets.getWalletHistory({
          chain,
          order: "DESC",
          address: walletAddress,
        })
      )
    );

    // Process only successful responses
    const transactions: TransactionWithType[] = results.flatMap(
      (result, index) => {
        if (result.status !== "fulfilled") {
          console.warn(
            `Failed to fetch transactions for chain ${chains[index]}`
          );
          return [];
        }

        return (result.value.toJSON().result as Transaction[]).flatMap((tx) => {
          const type: "Sent" | "Received" =
            tx.from_address.toLowerCase() === walletAddress.toLowerCase()
              ? "Sent"
              : "Received";

          // Apply filter directly while mapping
          return filter === "all" || filter.toLowerCase() === type.toLowerCase()
            ? [{ ...tx, type, chain: chains[index] }]
            : [];
        });
      }
    );

    // Sort transactions by timestamp in descending order
    return transactions.sort(
      (a, b) =>
        new Date(b.block_timestamp).getTime() -
        new Date(a.block_timestamp).getTime()
    );
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}
