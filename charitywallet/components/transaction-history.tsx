import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";
import Moralis from "moralis";
import Web3 from "web3";
import { initializeMoralis } from "@/lib/moralis";

// Instantiate web3
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
  chain: "0x1" | "0x89"; // "0x1" for Ethereum, "0x89" for Polygon
}

interface TransactionHistoryProps {
  walletAddress: string;
}

function convertWeiToEth(wei: string): string {
  try {
    return web3.utils.fromWei(wei, "ether");
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

async function fetchBothTransactions(
  walletAddress: string
): Promise<TransactionWithType[]> {
  try {
    // Call getWalletHistory for Ethereum and Polygon
    const [ethResponse, polygonResponse] = await Promise.all([
      Moralis.EvmApi.wallets.getWalletHistory({
        chain: "0x1", // Ethereum
        order: "DESC",
        address: walletAddress,
      }),
      Moralis.EvmApi.wallets.getWalletHistory({
        chain: "0x89", // Polygon
        order: "DESC",
        address: walletAddress,
      }),
    ]);

    // Convert responses to JSON so we can access the result property

    console.log("ethResponse:", polygonResponse);
    const ethTransactions = ethResponse.toJSON().result as Transaction[];
    const polygonTransactions = polygonResponse.toJSON()
      .result as Transaction[];

    const mappedEth: TransactionWithType[] = ethTransactions.map(
      (tx): TransactionWithType => ({
        ...tx,
        type:
          tx.from_address.toLowerCase() === walletAddress.toLowerCase()
            ? "Sent"
            : "Received",
        chain: "0x1",
      })
    );

    const mappedPolygon: TransactionWithType[] = polygonTransactions.map(
      (tx): TransactionWithType => ({
        ...tx,
        type:
          tx.from_address.toLowerCase() === walletAddress.toLowerCase()
            ? "Sent"
            : "Received",
        chain: "0x89",
      })
    );

    // Combine both arrays and sort by timestamp descending
    const combined = [...mappedEth, ...mappedPolygon].sort(
      (a, b) =>
        new Date(b.block_timestamp).getTime() -
        new Date(a.block_timestamp).getTime()
    );
    return combined;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to load transaction history.");
  }
}

const chainToSymbol: { [chain: string]: string } = {
  "0x1": "ETH",
  "0x89": "POL",
};

export default async function TransactionHistory({
  walletAddress,
}: TransactionHistoryProps) {
  await initializeMoralis();

  let transactions: TransactionWithType[] = [];
  try {
    transactions = await fetchBothTransactions(walletAddress);
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
              const nativeValue = convertWeiToEth(tx.value);
              const addressToCopy =
                tx.type === "Received" ? tx.from_address : tx.to_address;
              const formattedDate = formatDate(tx.block_timestamp);
              const symbol = chainToSymbol[tx.chain] || "Unknown";
              return (
                <Card
                  key={tx.hash + tx.chain} // using tx.chain ensures a unique key
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
      ) : (
        <p className="text-center">No transactions found.</p>
      )}
    </div>
  );
}
