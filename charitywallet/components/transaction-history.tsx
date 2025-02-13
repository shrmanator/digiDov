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

export default async function TransactionHistory({
  walletAddress,
}: TransactionHistoryProps) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    console.error("Thirdweb Client ID is not configured.");
    return <p>Client ID is missing.</p>;
  }

  // Supported chains: Ethereum (1) and Polygon (137)
  const supportedChains = ["1", "137"];
  const chainQuery = supportedChains.map((chain) => `chain=${chain}`).join("&");

  const baseUrl = "https://insight.thirdweb.com/v1/transactions";
  const incomingUrl = `${baseUrl}?${chainQuery}&filter_to_address=0xf977814e90da44bfa03b6295a0616a897441acec&limit=100`;
  const outgoingUrl = `${baseUrl}?${chainQuery}&filter_from_address=${walletAddress}&limit=100`;

  try {
    const [incomingResponse, outgoingResponse] = await Promise.all([
      axios.get(incomingUrl, { headers: { "X-Client-Id": clientId } }),
      axios.get(outgoingUrl, { headers: { "X-Client-Id": clientId } }),
    ]);

    // Rebuild transactions without including an incompatible "type" property.
    const incoming: TransactionWithType[] = (
      incomingResponse.data.data || []
    ).map((tx: Transaction) => ({
      hash: tx.hash,
      value: tx.value,
      from_address: tx.from_address,
      to_address: tx.to_address,
      block_number: tx.block_number,
      type: "Received",
    }));
    const outgoing: TransactionWithType[] = (
      outgoingResponse.data.data || []
    ).map((tx: Transaction) => ({
      hash: tx.hash,
      value: tx.value,
      from_address: tx.from_address,
      to_address: tx.to_address,
      block_number: tx.block_number,
      type: "Sent",
    }));

    const transactions: TransactionWithType[] = [...incoming, ...outgoing];

    return (
      <div className="w-full">
        {transactions.length ? (
          <ScrollArea style={{ height: "70vh" }} className="w-full">
            <div className="flex flex-col space-y-4 p-4">
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
                          {ethValue} POL
                        </span>
                      </div>
                      <WalletCopyButton walletAddress={addressToCopy} />
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
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
    return <p>Failed to load transaction history.</p>;
  }
}
