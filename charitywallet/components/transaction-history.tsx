import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";
import Moralis from "moralis";
import Web3 from "web3";
import { initializeMoralis } from "@/lib/moralis";
import { polygon } from "thirdweb/chains";

// Instantiate web3 (using the default provider; configure if necessary)
const web3 = new Web3();

interface Transaction {
  hash: string;
  value: string;
  from_address: string;
  to_address: string;
  block_number: string;
  block_timestamp: string;
}

interface TransactionWithType extends Transaction {
  type: "Received" | "Sent";
}

interface TransactionHistoryProps {
  walletAddress: string;
}

// Convert wei to ETH using web3
function convertWeiToEth(wei: string): string {
  try {
    return web3.utils.fromWei(wei, "ether");
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
}

// Format a timestamp to YYYY-MM-DD
function formatDate(timestamp: string): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

// Fetch transactions using Moralis's new native transactions endpoint
async function fetchTransactions(
  walletAddress: string
): Promise<TransactionWithType[]> {
  try {
    const response = await Moralis.EvmApi.transaction.getWalletTransactions({
      chain: polygon.id, // Ethereum mainnet; adjust for other chains as needed
      order: "DESC",
      address: walletAddress,
    });
    console.log("Transactions:", response.raw);
    // The API returns a raw object with a "result" array.
    const transactions = response.raw.result as Transaction[];
    const mapped: TransactionWithType[] = transactions.map(
      (tx): TransactionWithType => ({
        ...tx,
        type:
          tx.from_address.toLowerCase() === walletAddress.toLowerCase()
            ? "Sent"
            : "Received",
      })
    );
    // Sort transactions by timestamp descending
    mapped.sort(
      (a, b) =>
        new Date(b.block_timestamp).getTime() -
        new Date(a.block_timestamp).getTime()
    );
    return mapped;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to load transaction history.");
  }
}

const chainToSymbol: { [chain: string]: string } = {
  "0x1": "ETH",
};

export default async function TransactionHistory({
  walletAddress,
}: TransactionHistoryProps) {
  // Ensure Moralis is initialized
  await initializeMoralis();

  let transactions: TransactionWithType[] = [];
  try {
    transactions = await fetchTransactions(walletAddress);
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
          <div className="flex flex-col space-y-4">
            {transactions.map((tx) => {
              const ethValue = convertWeiToEth(tx.value);
              const addressToCopy =
                tx.type === "Received" ? tx.from_address : tx.to_address;
              const formattedDate = formatDate(tx.block_timestamp);
              const symbol = chainToSymbol["0x1"] || "Unknown";
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
