import React from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatEther } from "ethers";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";

interface Transaction {
  hash: string;
  value: number | string;
  from_address: string;
  to_address: string;
  block_number: string;
  block_timestamp: string;
  chain_id: number; // Ensure this is included
}

interface TransactionWithType extends Transaction {
  type: "Received" | "Sent";
}

interface TransactionHistoryProps {
  walletAddress: string;
}

function convertWeiToEth(wei: number | string): string {
  try {
    return formatEther(wei.toString());
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
}

function formatDate(timestamp: string | number): string {
  return new Date(Number(timestamp) * 1000).toISOString().split("T")[0]; // Extract YYYY-MM-DD
}

async function fetchTransactions(walletAddress: string, clientId: string) {
  const supportedChains = ["1", "137"];
  const chainQuery = supportedChains.map((chain) => `chain=${chain}`).join("&");

  const baseUrl = "https://insight.thirdweb.com/v1/transactions";
  const incomingUrl = `${baseUrl}?${chainQuery}&filter_to_address=${walletAddress}&limit=100`;
  const outgoingUrl = `${baseUrl}?${chainQuery}&filter_from_address=${walletAddress}&limit=100`;

  try {
    const [incomingResponse, outgoingResponse] = await Promise.all([
      axios.get(incomingUrl, { headers: { "X-Client-Id": clientId } }),
      axios.get(outgoingUrl, { headers: { "X-Client-Id": clientId } }),
    ]);

    const incoming: TransactionWithType[] = (
      incomingResponse.data.data || []
    ).map((tx: Transaction) => ({
      ...tx,
      type: "Received",
    }));

    const outgoing: TransactionWithType[] = (
      outgoingResponse.data.data || []
    ).map((tx: Transaction) => ({
      ...tx,
      type: "Sent",
    }));

    const allTransactions = [...incoming, ...outgoing];

    allTransactions.sort(
      (a, b) =>
        new Date(Number(b.block_timestamp) * 1000).getTime() -
        new Date(Number(a.block_timestamp) * 1000).getTime()
    );

    return allTransactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to load transaction history.");
  }
}

const chainIdToSymbol: { [key: number]: string } = {
  1: "ETH",
  137: "POL",
  // Add other chain IDs and their symbols as needed
};

export default async function TransactionHistory({
  walletAddress,
}: TransactionHistoryProps) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    console.error("Thirdweb Client ID is not configured.");
    return <p>Client ID is missing.</p>;
  }

  let transactions: TransactionWithType[] = [];
  try {
    // Test this with 0x21a31ee1afc51d94c2efccaa2092ad1028285549 (Binance "8" wallet)
    transactions = await fetchTransactions(walletAddress, clientId);
  } catch (error) {
    return (
      <p>
        {error instanceof Error
          ? error.message
          : "Could not load transaction history."}
      </p>
    );
  }

  return (
    <div className="w-full">
      {transactions.length ? (
        <ScrollArea style={{ height: "70vh" }} className="w-full">
          <div className="flex flex-col space-y-4 p-4">
            {transactions.map((tx) => {
              const ethValue = convertWeiToEth(tx.value);
              const addressToCopy =
                tx.type === "Received" ? tx.from_address : tx.to_address;
              const formattedDate = formatDate(tx.block_timestamp); // Truncated time
              const symbol = chainIdToSymbol[tx.chain_id] || "Unknown";

              return (
                <Card
                  key={tx.hash}
                  className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
                >
                  <CardContent className="flex flex-col p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-semibold">
                        {ethValue} {symbol}
                      </span>
                      {tx.type === "Received" ? (
                        <ArrowDownLeft className="text-green-500 h-6 w-6" />
                      ) : (
                        <ArrowUpRight className="text-red-500 h-6 w-6" />
                      )}
                    </div>

                    {/* Date and Wallet (Now Responsive) */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">
                        {formattedDate}
                      </p>
                      <WalletCopyButton walletAddress={addressToCopy} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-center">No transactions found.</p>
      )}
    </div>
  );
}
