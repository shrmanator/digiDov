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

// This interface extends `Transaction` and adds your custom fields:
export interface TransactionWithType extends Transaction {
  type: "Received" | "Sent";
  chain: "0x1" | "0x89";
}

/**
 * Fetch transactions from both Ethereum (0x1) and Polygon (0x89).
 * This function assumes Moralis is already initialized (via `initializeMoralis`).
 */
export async function fetchBothTransactions(
  walletAddress: string
): Promise<TransactionWithType[]> {
  try {
    const [ethResponse, polygonResponse] = await Promise.all([
      Moralis.EvmApi.wallets.getWalletHistory({
        chain: "0x1",
        order: "DESC",
        address: walletAddress,
      }),
      Moralis.EvmApi.wallets.getWalletHistory({
        chain: "0x89",
        order: "DESC",
        address: walletAddress,
      }),
    ]);

    // Convert to JSON so we can access the 'result'
    const ethTxs = ethResponse.toJSON().result as Transaction[];
    const polygonTxs = polygonResponse.toJSON().result as Transaction[];

    // Map each array, adding "type" and "chain"
    const mappedEth: TransactionWithType[] = ethTxs.map((tx) => ({
      ...tx,
      type:
        tx.from_address.toLowerCase() === walletAddress.toLowerCase()
          ? ("Sent" as const)
          : ("Received" as const),
      chain: "0x1" as const,
    }));

    const mappedPolygon: TransactionWithType[] = polygonTxs.map((tx) => ({
      ...tx,
      type:
        tx.from_address.toLowerCase() === walletAddress.toLowerCase()
          ? ("Sent" as const)
          : ("Received" as const),
      chain: "0x89" as const,
    }));

    // Combine and sort by timestamp descending
    return [...mappedEth, ...mappedPolygon].sort(
      (a, b) =>
        new Date(b.block_timestamp).getTime() -
        new Date(a.block_timestamp).getTime()
    );
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
}
