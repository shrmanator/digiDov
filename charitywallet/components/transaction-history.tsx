// components/TransactionHistory.tsx
import React from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { formatEther } from "ethers";
import { ArrowDown, ArrowUp } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";

interface Transaction {
  hash: string;
  value: number | string;
  from_address: string;
  to_address: string;
  block_number: string;
}

interface TransactionWithType extends Transaction {
  type: "Received" | "Sent";
}

interface TransactionHistoryProps {
  walletAddress: string;
  chainId: string;
}

function convertWeiToEth(wei: number | string): string {
  try {
    return formatEther(wei.toString());
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
}

export default async function TransactionHistory({
  walletAddress,
  chainId,
}: TransactionHistoryProps) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    console.error("Thirdweb Client ID is not configured.");
    return <p>Client ID is missing.</p>;
  }

  const baseUrl = "https://1.insight.thirdweb.com/v1/transactions";
  const incomingUrl = `${baseUrl}?chain=${chainId}&filter_to_address=${walletAddress}&limit=100`;
  const outgoingUrl = `${baseUrl}?chain=${chainId}&filter_from_address=${walletAddress}&limit=100`;

  try {
    const [incomingResponse, outgoingResponse] = await Promise.all([
      axios.get(incomingUrl, { headers: { "X-Client-Id": clientId } }),
      axios.get(outgoingUrl, { headers: { "X-Client-Id": clientId } }),
    ]);

    const incoming: Transaction[] = incomingResponse.data.data || [];
    const outgoing: Transaction[] = outgoingResponse.data.data || [];

    const transactions: TransactionWithType[] = [
      ...incoming.map(
        (tx): TransactionWithType => ({ ...tx, type: "Received" })
      ),
      ...outgoing.map((tx): TransactionWithType => ({ ...tx, type: "Sent" })),
    ];

    return (
      <div className="w-full">
        {transactions.length ? (
          <div className="flex flex-col space-y-4">
            {transactions.map((tx) => {
              const ethValue = convertWeiToEth(tx.value);
              const addressToCopy =
                tx.type === "Received" ? tx.from_address : tx.to_address;
              return (
                <Card
                  key={tx.hash}
                  className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      {tx.type === "Received" ? (
                        <ArrowDown className="text-green-500 h-6 w-6" />
                      ) : (
                        <ArrowUp className="text-red-500 h-6 w-6" />
                      )}
                      <span className="text-xl font-semibold">
                        {tx.type === "Received"
                          ? `${ethValue} ETH`
                          : `${ethValue} ETH`}
                      </span>
                    </div>
                    <WalletCopyButton walletAddress={addressToCopy} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center">No transactions found.</p>
        )}
      </div>
    );
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
    return <p>Failed to load transaction history.</p>;
  }
}
