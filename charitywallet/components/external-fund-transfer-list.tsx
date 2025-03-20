"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Link,
} from "lucide-react";
import { getCharityFundTransfers } from "@/app/actions/charities";

interface FundTransfer {
  id: string;
  charity_id: string;
  amount_wei: string;
  fiat_equivalent: number | null;
  fiat_currency: string;
  destination_wallet: string;
  transaction_hash: string;
  chain_id: string;
  createdAt: string;
}

interface ExternalWalletTransfersListProps {
  charityId: string;
}

export default function ExternalWalletTransfersList({
  charityId,
}: ExternalWalletTransfersListProps) {
  const [transfers, setTransfers] = useState<FundTransfer[]>([]);
  const [groupedTransfers, setGroupedTransfers] = useState<
    Record<string, FundTransfer[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );
  const [totalFiatAmount, setTotalFiatAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    const response = await getCharityFundTransfers(charityId);
    if (response.success) {
      const mappedTransfers: FundTransfer[] = (response.transfers ?? []).map(
        (transfer) => ({
          id: transfer.id,
          createdAt: new Date(transfer.created_at).toISOString(),
          transaction_hash: transfer.transaction_hash,
          charity_id: transfer.charity_id,
          amount_wei: transfer.amount_wei.toString(),
          fiat_equivalent: transfer.fiat_equivalent,
          fiat_currency: transfer.fiat_currency ?? "USD",
          destination_wallet: transfer.destination_wallet,
          chain_id: transfer.chain_id ?? "N/A",
        })
      );
      setTransfers(mappedTransfers);

      // Set the currency from the first transfer with a valid currency
      if (mappedTransfers.length > 0) {
        const firstValidCurrency =
          mappedTransfers.find(
            (t) => t.fiat_currency && t.fiat_currency !== "N/A"
          )?.fiat_currency || "USD";
        setCurrency(firstValidCurrency);
      }

      // Calculate total amount across all transfers
      const total = mappedTransfers.reduce(
        (sum, transfer) => sum + (transfer.fiat_equivalent ?? 0),
        0
      );
      setTotalFiatAmount(total);

      // Group transfers by the date of creation.
      const groups: Record<string, FundTransfer[]> = {};
      mappedTransfers.forEach((transfer) => {
        const dateKey = new Date(transfer.createdAt).toLocaleDateString();
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(transfer);
      });
      setGroupedTransfers(groups);

      // Initialize each date as collapsed.
      const initialExpanded: Record<string, boolean> = {};
      Object.keys(groups).forEach((dateKey) => {
        initialExpanded[dateKey] = false;
      });

      // Auto-expand the most recent date if there are any transfers
      if (Object.keys(groups).length > 0) {
        const mostRecentDate = Object.keys(groups).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )[0];
        initialExpanded[mostRecentDate] = true;
      }

      setExpandedDates(initialExpanded);
    }
    setLoading(false);
  }, [charityId]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const getTotalForDate = (transfers: FundTransfer[]) => {
    return transfers
      .reduce((sum, transfer) => sum + (transfer.fiat_equivalent ?? 0), 0)
      .toFixed(2);
  };

  // Helper to abbreviate long strings such as wallet addresses or transaction hashes.
  const shortenString = (str: string, frontChars = 6, backChars = 4) => {
    if (str.length <= frontChars + backChars) return str;
    return `${str.slice(0, frontChars)}...${str.slice(-backChars)}`;
  };

  // Helper to get the explorer URL for a given chain and transaction hash
  const getExplorerUrl = (chainId: string, txHash: string) => {
    const explorers: Record<string, string> = {
      "1": "https://etherscan.io/tx/",
      "137": "https://polygonscan.com/tx/",
      "56": "https://bscscan.com/tx/",
      "42161": "https://arbiscan.io/tx/",
      "10": "https://optimistic.etherscan.io/tx/",
      // Add more chains as needed
    };

    return explorers[chainId] ? `${explorers[chainId]}${txHash}` : null;
  };

  // Helper to format chain name
  const getChainName = (chainId: string) => {
    const chainNames: Record<string, string> = {
      "1": "Ethereum",
      "137": "Polygon",
      "56": "BSC",
      "42161": "Arbitrum",
      "10": "Optimism",
      // Add more chains as needed
    };

    return chainNames[chainId] || chainId;
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-6 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <p>No fund transfers found for this charity.</p>
      </div>
    );
  }

  // Sort dates so that the most recent appears first.
  const sortedDates = Object.keys(groupedTransfers).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="w-full">
      {/* Summary header */}
      <div className="mb-4 p-4 bg-primary/5 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Transfers
            </h3>
            <p className="text-lg font-semibold">
              {transfers.length} transactions
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground text-right">
              Total Value
            </h3>
            <p className="text-lg font-semibold text-right">
              ${totalFiatAmount.toFixed(2)} {currency.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {sortedDates.map((dateKey) => {
        const transfersForDate = groupedTransfers[dateKey];
        const totalAmount = getTotalForDate(transfersForDate);
        const isExpanded = expandedDates[dateKey];
        const dateObj = new Date(dateKey);
        const formattedDate = `${
          dateObj.getMonth() + 1
        }/${dateObj.getDate()}/${dateObj.getFullYear()}`;

        return (
          <div key={dateKey} className="border-b border-border">
            <div
              className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => toggleDateExpansion(dateKey)}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{formattedDate}</div>
                  <div className="text-xs text-muted-foreground">
                    {transfersForDate.length} transfers
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Total Amount
                  </div>
                  <div className="font-medium">
                    ${totalAmount}{" "}
                    {transfersForDate[0].fiat_currency.toUpperCase()}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="bg-background/50">
                {transfersForDate.map((transfer, index) => {
                  const transferTime = new Date(transfer.createdAt);
                  const timeString = transferTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const explorerUrl = getExplorerUrl(
                    transfer.chain_id,
                    transfer.transaction_hash
                  );
                  const chainName = getChainName(transfer.chain_id);

                  return (
                    <div
                      key={transfer.id}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-accent/5 transition-colors ${
                        index !== transfersForDate.length - 1
                          ? "border-b border-border/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-secondary/30 rounded-full flex items-center justify-center text-xs uppercase font-medium">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {shortenString(transfer.destination_wallet)}
                            <button
                              className="text-primary hover:text-primary/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  transfer.destination_wallet
                                );
                              }}
                              title="Copy wallet address"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect
                                  x="9"
                                  y="9"
                                  width="13"
                                  height="13"
                                  rx="2"
                                  ry="2"
                                ></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            </button>
                          </div>
                          <div className="text-xs flex items-center gap-2 mt-1">
                            <div
                              className="bg-accent/20 text-primary-foreground px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-accent/30 cursor-pointer transition-colors max-w-fit group"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (explorerUrl) {
                                  window.open(explorerUrl, "_blank");
                                } else {
                                  navigator.clipboard.writeText(
                                    transfer.transaction_hash
                                  );
                                }
                              }}
                              title={
                                explorerUrl
                                  ? "View on block explorer"
                                  : "Copy transaction hash"
                              }
                            >
                              <span className="font-mono font-medium">
                                {shortenString(transfer.transaction_hash, 5, 4)}
                              </span>
                              {explorerUrl ? (
                                <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              )}
                            </div>
                            <div className="bg-primary/10 text-xs px-2 py-0.5 rounded-md font-medium max-w-fit">
                              {chainName}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {timeString}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="font-medium">
                          $
                          {transfer.fiat_equivalent !== null
                            ? transfer.fiat_equivalent.toFixed(2)
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
