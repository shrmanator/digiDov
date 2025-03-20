"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  AlertCircle,
  ExternalLink,
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

  // Helper to format chain name with special cases for "0x89" and "0x1"
  const getChainName = (chainId: string) => {
    const normalizedChainId = chainId.toLowerCase();
    if (normalizedChainId === "0x89") return "Polygon";
    if (normalizedChainId === "0x1") return "Ethereum";

    const chainNames: Record<string, string> = {
      "1": "Ethereum",
      "137": "Polygon",
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
              Total Amount
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
                  const chainName = getChainName(transfer.chain_id);
                  const blockScanUrl = `https://blockscan.com/tx/${transfer.transaction_hash}`;

                  return (
                    <div
                      key={transfer.id}
                      className={`px-4 py-3 hover:bg-accent/5 transition-colors ${
                        index !== transfersForDate.length - 1
                          ? "border-b border-border/50"
                          : ""
                      }`}
                    >
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div>
                          <span className="font-medium">
                            Destination Wallet:{" "}
                          </span>
                          <span className="font-mono">
                            {transfer.destination_wallet}
                          </span>
                          <button
                            className="text-primary hover:text-primary/80 transition-colors ml-2"
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

                        <div>
                          <span className="font-medium">
                            Transaction Hash:{" "}
                          </span>
                          <span className="font-mono">
                            {transfer.transaction_hash}
                          </span>
                          <div className="inline-flex gap-2 ml-2">
                            <button
                              type="button"
                              className="text-primary hover:text-primary/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(blockScanUrl, "_blank");
                              }}
                              title="View on Blockscan"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              className="text-primary hover:text-primary/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  transfer.transaction_hash
                                );
                              }}
                              title="Copy transaction hash"
                            >
                              <svg
                                width="12"
                                height="12"
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
                        </div>

                        <div>
                          <span className="font-medium">Chain: </span>
                          {chainName}
                        </div>
                        <div>
                          <span className="font-medium">Time: </span>
                          {timeString}
                        </div>
                        <div>
                          <span className="font-medium">Amount: </span>$
                          {transfer.fiat_equivalent !== null
                            ? transfer.fiat_equivalent.toFixed(2)
                            : "0.00"}
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
