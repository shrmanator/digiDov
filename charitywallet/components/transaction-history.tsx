"use client";

import { fetchAllTransfers } from "@/utils/get-transaction-history";
import { useState, useEffect } from "react";

interface Transaction {
  hash: string;
  asset: string;
  category: string;
  value?: string;
  from: string;
  to: string | null;
  blockTimestamp: string; // Flatten metadata
}

interface TransactionHistoryProps {
  walletAddress: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  walletAddress,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch transactions
        // console.log("Fetching transactions for wallet:", walletAddress);
        const transferResponses = await fetchAllTransfers(walletAddress);
        console.log("transferResponses", transferResponses);
        // Convert Alchemy response to our Transaction type
        const allTransfers: Transaction[] = transferResponses.flatMap(
          (response) =>
            response.transfers.map((tx) => ({
              hash: tx.hash,
              asset: tx.asset || "Unknown",
              category: tx.category,
              value: tx.value ? tx.value.toString() : "N/A",
              from: tx.from,
              to: tx.to,
              blockTimestamp: "Unknown",
            }))
        );

        setTransactions(allTransfers);
      } catch (err) {
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

      {loading && <p>Loading transactions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && transactions.length === 0 && <p>No transactions found.</p>}

      <ul className="space-y-4">
        {transactions.map((tx, index) => (
          <li
            key={tx.hash || index}
            className="border p-2 rounded-md bg-gray-800"
          >
            <p>
              <strong>Asset:</strong> {tx.asset}
            </p>
            <p>
              <strong>Value:</strong> {tx.value}
            </p>
            <p>
              <strong>From:</strong> {tx.from}
            </p>
            <p>
              <strong>To:</strong> {tx.to}
            </p>
            <p>
              <strong>Category:</strong> {tx.category}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(tx.blockTimestamp).toLocaleString()}
            </p>
            <p>
              <strong>Tx Hash:</strong>{" "}
              <a
                href={`https://etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
