"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationReceiptDto } from "@/app/types/receipt";
import { getDonationReceiptsForCharity } from "@/app/actions/receipts";

interface DonationReceiptsListProps {
  walletAddress: string;
}

export default function DonationReceiptsList({
  walletAddress,
}: DonationReceiptsListProps) {
  const [receipts, setReceipts] = useState<DonationReceiptDto[]>([]);
  const [groupedReceipts, setGroupedReceipts] = useState<
    Record<string, DonationReceiptDto[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    // Use the passed walletAddress to fetch the donation receipts
    const fetchedReceipts = await getDonationReceiptsForCharity(walletAddress);
    setReceipts(fetchedReceipts);

    // Initialize all dates as collapsed (closed)
    const initialExpandState: Record<string, boolean> = {};
    fetchedReceipts.forEach((receipt) => {
      const dateKey = new Date(receipt.donation_date).toLocaleDateString();
      initialExpandState[dateKey] = false;
    });
    setExpandedDates(initialExpandState);

    groupByDay(fetchedReceipts);
    setLoading(false);
  }, [walletAddress]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  function groupByDay(receipts: DonationReceiptDto[]) {
    const groups: Record<string, DonationReceiptDto[]> = {};
    receipts.forEach((receipt) => {
      const dateKey = new Date(receipt.donation_date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(receipt);
    });
    setGroupedReceipts(groups);
  }

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const getTotalForDate = (receipts: DonationReceiptDto[]) => {
    return receipts
      .reduce((sum, receipt) => sum + receipt.fiat_amount, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-6 text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="w-full p-4 text-center text-muted-foreground">
        No donation tax receipts found.
      </div>
    );
  }

  // Calculate overall total donations amount
  const totalDonationsAmount = receipts.reduce(
    (sum, receipt) => sum + receipt.fiat_amount,
    0
  );

  // Sort dates so that the most recent date appears first
  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-full">
      {/* Summary header */}
      <div className="mb-4 p-4 bg-primary/5 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Donations
            </h3>
            <p className="text-lg font-semibold">{receipts.length} donations</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground text-right">
              Total Amount
            </h3>
            <p className="text-lg font-semibold text-right">
              ${totalDonationsAmount.toFixed(2)} CAD
            </p>
          </div>
        </div>
      </div>

      {sortedDates.map((dateKey) => {
        const receiptsForDate = groupedReceipts[dateKey];
        const totalAmount = getTotalForDate(receiptsForDate);
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
                    {receiptsForDate.length} receipts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Total Amount
                  </div>
                  <div className="font-medium">${totalAmount}</div>
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
                {receiptsForDate.map((receipt, index) => {
                  const donationTime = new Date(receipt.donation_date);
                  const timeString = donationTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const initials = `${receipt.donor?.first_name?.[0] ?? ""}${
                    receipt.donor?.last_name?.[0] ?? ""
                  }`;

                  return (
                    <div
                      key={receipt.id}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-accent/5 transition-colors ${
                        index !== receiptsForDate.length - 1
                          ? "border-b border-border/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-secondary/30 rounded-full flex items-center justify-center text-xs uppercase font-medium">
                          {initials || "DS"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {receipt.donor?.first_name}{" "}
                            {receipt.donor?.last_name}
                          </div>
                          {receipt.donor?.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{receipt.donor.email}</span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {timeString}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="font-medium">
                          $ {receipt.fiat_amount.toFixed(2)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // open the real-download URL in a new tab
                            window.open(
                              `/api/receipts/${receipt.id}/download`,
                              "_blank"
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                          <span className="ml-1 text-xs">Download</span>
                        </Button>
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
