"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
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
          fiat_currency: transfer.fiat_currency ?? "N/A",
          destination_wallet: transfer.destination_wallet,
          chain_id: transfer.chain_id ?? "N/A",
        })
      );
      setTransfers(mappedTransfers);

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

  // Helper to abbreviate long strings such as wallet addresses or transaction hashes.
  const shortenString = (str: string, frontChars = 6, backChars = 4) => {
    if (str.length <= frontChars + backChars) return str;
    return `${str.slice(0, frontChars)}...${str.slice(-backChars)}`;
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
      <div className="w-full p-4 text-center text-muted-foreground">
        No fund transfers found.
      </div>
    );
  }

  // Sort dates so that the most recent appears first.
  const sortedDates = Object.keys(groupedTransfers).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="w-full">
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
                          <div className="font-medium">
                            {shortenString(transfer.destination_wallet)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tx: {shortenString(transfer.transaction_hash)}{" "}
                            &middot; Chain: {transfer.chain_id}
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
