// components/transaction-history.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";
import Web3 from "web3";

const web3 = new Web3();

interface Transaction {
  hash: string;
  value: string;
  from_address: string;
  to_address: string;
  block_timestamp: string;
  type: "Received" | "Sent";
  chain: "0x1" | "0x89";
}

// We accept an array of transactions, which the page fetches for us
interface TransactionHistoryProps {
  transactions: Transaction[];
}

// Convert Wei => ETH
function convertWeiToEth(wei: string): string {
  try {
    return web3.utils.fromWei(wei, "ether");
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
}

// Format date
function formatDate(timestamp: string): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

// Mapping chain ID => symbol
const chainToSymbol: { [chain: string]: string } = {
  "0x1": "ETH",
  "0x89": "POL",
};

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  if (!transactions.length) {
    return <p className="text-center">No transactions found.</p>;
  }

  return (
    <div className="w-full">
      <ScrollArea style={{ height: "70vh" }} className="w-full">
        <div className="flex flex-col space-y-4">
          {transactions.map((tx) => {
            const nativeValue = convertWeiToEth(tx.value);
            const addressToCopy =
              tx.type === "Received" ? tx.from_address : tx.to_address;
            const formattedDate = formatDate(tx.block_timestamp);
            const symbol = chainToSymbol[tx.chain] || "Unknown";

            return (
              <Card
                key={tx.hash + tx.chain}
                className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
              >
                <CardContent className="flex flex-col p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-semibold">
                      {nativeValue} {symbol}
                    </span>
                    {tx.type === "Received" ? (
                      <ArrowDownLeft className="text-green-500 h-6 w-6" />
                    ) : (
                      <ArrowUpRight className="text-red-500 h-6 w-6" />
                    )}
                  </div>
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
    </div>
  );
}
