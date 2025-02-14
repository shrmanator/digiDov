import React from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatEther } from "ethers";
import { ArrowDown, ArrowUp } from "lucide-react";
import { WalletCopyButton } from "./wallet-copy-button";

interface Transaction {
  hash: string;
  value: number | string;
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

function convertWeiToEth(wei: number | string): string {
  try {
    return formatEther(wei.toString());
  } catch (error) {
    console.error("Error converting wei to eth:", error);
    return "0";
  }
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

    console.log("Fetched transactions:", allTransactions[0].block_timestamp);

    return allTransactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to load transaction history.");
  }
}

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
              const formattedDate = new Date(
                Number(tx.block_timestamp) * 1000
              ).toLocaleString();

              return (
                <Card
                  key={tx.hash}
                  className="w-full rounded-xl border border-border bg-background hover:shadow-xl transition"
                >
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-4">
                    {/* Left Section: Transaction Details */}
                    <div className="flex items-center space-x-3">
                      {tx.type === "Received" ? (
                        <ArrowDown className="text-green-500 h-6 w-6" />
                      ) : (
                        <ArrowUp className="text-red-500 h-6 w-6" />
                      )}
                      <div>
                        <span className="text-xl font-semibold">
                          {ethValue} POL
                        </span>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* Right Section: Date & Copy Button */}
                    <div className="flex flex-col items-end md:items-center">
                      <p className="hidden md:block text-sm text-muted-foreground">
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
