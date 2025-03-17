import { client } from "@/lib/thirdwebClient";

// Extended interface with transaction type and chain info
export interface TransactionWithType {
  hash: string;
  value: string;
  from_address: string;
  to_address: string;
  block_number: string;
  block_timestamp: string;
  type: "Received" | "Sent";
  chain: "0x1" | "0x89";
}

// Helper function to fetch transactions from a single chain with proper error checking
const fetchChainTransactions = async (
  chain: string,
  walletAddress: string
): Promise<any> => {
  const url = `https://${chain}.insight.thirdweb.com/v1/transactions?filter[from_address]=${walletAddress}&filter[to_address]=${walletAddress}`;
  const response = await fetch(url, {
    headers: {
      "x-client-id": client.clientId,
    },
  });
  if (!response.ok) {
    // Read the error text so we can include it in the thrown error.
    const errorText = await response.text();
    throw new Error(
      `Error fetching chain ${chain}: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return await response.json();
};

/**
 * Fetch transactions from Ethereum (0x1) and Polygon (0x89), filtered by type.
 * @param walletAddress - The wallet address to fetch transactions for.
 * @param filter - Can be 'sent', 'received', or 'all'.
 * @returns A filtered list of transactions.
 */
export async function fetchTransactions(
  walletAddress: string,
  filter: "sent" | "received" | "all" = "all"
): Promise<TransactionWithType[]> {
  try {
    const chains = ["1", "137"]; // Ethereum mainnet and Polygon
    const clientId = client.clientId; // Your thirdweb API key

    // Fetch transactions for each chain in parallel using our helper
    const promises = chains.map((chain) =>
      fetchChainTransactions(chain, walletAddress)
    );
    const results = await Promise.allSettled(promises);
    console.log("Fetch results:", results);

    // Process only successful responses
    const transactions: TransactionWithType[] = results.flatMap(
      (result, index) => {
        if (result.status !== "fulfilled") {
          console.warn(
            `Failed to fetch transactions for chain ${chains[index]}:`,
            result.reason
          );
          return [];
        }
        // Assuming the response JSON has a `data` property that contains the transactions
        return result.value.data.flatMap((tx: any) => {
          const type: "Sent" | "Received" =
            tx.from_address.toLowerCase() === walletAddress.toLowerCase()
              ? "Sent"
              : "Received";

          // Apply the filter while mapping
          return filter === "all" || filter.toLowerCase() === type.toLowerCase()
            ? [
                {
                  hash: tx.hash,
                  value: tx.value,
                  from_address: tx.from_address,
                  to_address: tx.to_address,
                  block_number: tx.block_number,
                  block_timestamp: tx.block_timestamp,
                  type,
                  chain: chains[index] === "1" ? "0x1" : "0x89",
                },
              ]
            : [];
        });
      }
    );

    // Sort transactions by timestamp (most recent first)
    transactions.sort(
      (a, b) =>
        new Date(b.block_timestamp).getTime() -
        new Date(a.block_timestamp).getTime()
    );

    return transactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}
