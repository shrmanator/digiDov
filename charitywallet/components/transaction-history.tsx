// components/TransactionHistory.tsx
import React from "react";
import axios from "axios";

interface Transaction {
  hash: string;
  from_address: string;
  to_address: string;
  value: number | string;
  block_number: string;
  // add additional fields if needed
}

interface TransactionHistoryProps {
  walletAddress: string;
  chainId: string;
}

export default async function TransactionHistory({
  walletAddress,
  chainId,
}: TransactionHistoryProps) {
  // Use the public client id
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    console.error("Thirdweb Client ID is not configured.");
    return <p>Client ID is missing.</p>;
  }

  // Base URL from the docs
  const baseUrl = "https://1.insight.thirdweb.com/v1/transactions";
  // Filter by wallet address: incoming (to) and outgoing (from)
  const incomingUrl = `${baseUrl}?chain=${chainId}&filter_to_address=${walletAddress}&limit=100`;
  const outgoingUrl = `${baseUrl}?chain=${chainId}&filter_from_address=${walletAddress}&limit=100`;

  try {
    // Perform both requests concurrently.
    const [incomingResponse, outgoingResponse] = await Promise.all([
      axios.get(incomingUrl, {
        headers: { "X-Client-Id": clientId },
      }),
      axios.get(outgoingUrl, {
        headers: { "X-Client-Id": clientId },
      }),
    ]);

    // According to the docs, the data is under the "data" key.
    const incoming: Transaction[] = incomingResponse.data.data || [];
    const outgoing: Transaction[] = outgoingResponse.data.data || [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>

        <div>
          <h3 className="text-xl font-semibold">Incoming Transactions</h3>
          {incoming.length ? (
            <ul className="space-y-4">
              {incoming.map((tx) => (
                <li key={tx.hash} className="p-4 border rounded-md">
                  <p>
                    <strong>From:</strong> {tx.from_address}
                  </p>
                  <p>
                    <strong>Value:</strong> {tx.value}
                  </p>
                  <p>
                    <strong>Block:</strong> {tx.block_number}
                  </p>
                  <p>
                    <strong>Tx Hash:</strong> {tx.hash}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No incoming transactions found.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold">Outgoing Transactions</h3>
          {outgoing.length ? (
            <ul className="space-y-4">
              {outgoing.map((tx) => (
                <li key={tx.hash} className="p-4 border rounded-md">
                  <p>
                    <strong>To:</strong> {tx.to_address}
                  </p>
                  <p>
                    <strong>Value:</strong> {tx.value}
                  </p>
                  <p>
                    <strong>Block:</strong> {tx.block_number}
                  </p>
                  <p>
                    <strong>Tx Hash:</strong> {tx.hash}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No outgoing transactions found.</p>
          )}
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
    return <p>Failed to load transaction history.</p>;
  }
}
