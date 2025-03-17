import { client } from "@/lib/thirdwebClient";
import {
  fetchChainTransactions,
  fetchDonationsToWallet,
} from "./fetch-contract-transactions";

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
// Helper function to fetch transactions from the new Thirdweb endpoint with proper error checking
// const fetchChainTransactions = async (
//   chain: string,
//   walletAddress: string
// ): Promise<any> => {
//   const url = `https://insight.thirdweb.com/v1/events/0x1C8Ed2efAeD9F2d4F13e8F95973Ac8B50A862Ef0?chain=137&limit=20`;

//   const response = await fetch(url, {
//     headers: {
//       "x-client-id": "d98b838c8c5cd1775c46b05d7385b215",
//     },
//   });
//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(
//       `Error fetching transactions for wallet ${walletAddress} on chain ${chain}: ${response.status} ${response.statusText} - ${errorText}`
//     );
//   }
//   return await response.json();
// };

// Helper to format a UNIX timestamp (seconds) to a readable string.
const formatTimestamp = (
  timestampSec: string
): { formatted: string; raw: number } => {
  const rawTimestamp = Number(timestampSec) * 1000; // Convert seconds to ms
  const formatted = new Date(rawTimestamp).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { formatted, raw: rawTimestamp };
};

/**
 * Fetch transactions from Ethereum (0x1) and Polygon (0x89), filtered by type.
 * @param walletAddress - The wallet address to fetch transactions for.
 * @param filter - Can be 'sent', 'received', or 'all'.
 * @returns A filtered list of transactions with formatted timestamps.
 */
export async function fetchTransactions(
  walletAddress: string,
  filter: "sent" | "received" | "all" = "all"
): Promise<TransactionWithType[]> {
  try {
    const chains = ["1", "137"]; // Ethereum mainnet and Polygon

    // Fetch transactions for each chain in parallel using our helper
    const promises = chains.map((chain) =>
      fetchDonationsToWallet(chain, walletAddress)
    );

    const results = await Promise.allSettled(promises);
    console.log("the32 main results", JSON.stringify(results, null, 2));

    // We'll temporarily include a rawTimestamp property for sorting.
    const transactions: (TransactionWithType & { rawTimestamp: number })[] =
      results.flatMap((result, index) => {
        if (result.status !== "fulfilled") {
          console.warn(
            `Failed to fetch transactions for chain ${chains[index]}:`,
            result.reason
          );
          return [];
        }
        // Process each transaction
        return result.value.data.flatMap((tx: any) => {
          const type: "Sent" | "Received" =
            tx.from_address.toLowerCase() === walletAddress.toLowerCase()
              ? "Sent"
              : "Received";

          // Convert and format the block_timestamp properly.
          const { formatted, raw } = formatTimestamp(tx.block_timestamp);

          // Apply the filter while mapping
          return filter === "all" || filter.toLowerCase() === type.toLowerCase()
            ? [
                {
                  hash: tx.hash,
                  value: tx.value,
                  from_address: tx.from_address,
                  to_address: tx.to_address,
                  block_number: tx.block_number,
                  block_timestamp: formatted, // now a human-readable string
                  type,
                  chain: chains[index] === "1" ? "0x1" : "0x89",
                  rawTimestamp: raw, // temporary property for sorting
                },
              ]
            : [];
        });
      });

    // Sort transactions by raw timestamp (most recent first)
    transactions.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

    // Remove the temporary rawTimestamp property before returning
    const finalTransactions = transactions.map(({ rawTimestamp, ...tx }) => tx);

    return finalTransactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}
