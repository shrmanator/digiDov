"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDonationReceipts,
  getDonationReceiptPdf,
} from "@/app/actions/receipts";
import { DonationReceipt } from "@/app/types/receipt";

// Helper functions to compare dates
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(receiptDate: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(receiptDate, yesterday);
}

// Group receipts into categories: "Today", "Yesterday", or a specific date string.
function groupReceiptsByDate(receipts: DonationReceipt[]) {
  const grouped: Record<string, DonationReceipt[]> = {};
  const today = new Date();
  receipts.forEach((receipt) => {
    const receiptDate = new Date(receipt.donation_date);
    let label: string;
    if (isSameDay(receiptDate, today)) {
      label = "Today";
    } else if (isYesterday(receiptDate, today)) {
      label = "Yesterday";
    } else {
      label = receiptDate.toLocaleDateString();
    }
    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(receipt);
  });
  return grouped;
}

interface TaxReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
}
interface TaxReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function TaxReceiptDrawer({
  open,
  onClose,
  walletAddress,
}: TaxReceiptDrawerProps) {
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchReceipts();
    }
  }, [open]);

  async function fetchReceipts() {
    setLoading(true);
    try {
      const data = await getDonationReceipts(walletAddress);
      // Sort receipts by donation_date descending (most recent first)
      const sortedReceipts = data.sort(
        (a, b) =>
          new Date(b.donation_date).getTime() -
          new Date(a.donation_date).getTime()
      );
      setReceipts(sortedReceipts);
    } catch (error) {
      console.error("Error fetching donation receipts:", error);
    }
    setLoading(false);
  }

  async function downloadReceipt(receiptId: string) {
    try {
      const pdfBase64 = await getDonationReceiptPdf(receiptId);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `receipt-${receiptId}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error downloading receipt PDF:", error);
    }
  }

  // Group receipts by date if not loading and if receipts exist
  const groupedReceipts =
    !loading && receipts.length > 0 ? groupReceiptsByDate(receipts) : {};

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Donation Tax Receipts</DrawerTitle>
            <DrawerDescription>
              View and download your tax receipts.
            </DrawerDescription>
          </DrawerHeader>
          {/* Wrap the list in a scrollable container */}
          <div className="p-4 pb-0 max-h-[300px] overflow-y-auto">
            {loading ? (
              <ul className="space-y-4">
                {[...Array(receipts.length || 1)].map((_, index) => (
                  <li key={index} className="p-3 border rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-20 mt-2" />
                  </li>
                ))}
              </ul>
            ) : receipts.length === 0 ? (
              <p>No receipts found.</p>
            ) : (
              // Render grouped receipts with date headers
              Object.keys(groupedReceipts).map((dateLabel) => (
                <div key={dateLabel} className="mb-4">
                  <h3 className="text-sm font-bold mb-2">{dateLabel}</h3>
                  <ul className="space-y-4">
                    {groupedReceipts[dateLabel].map((receipt) => (
                      <li key={receipt.id} className="p-3 border rounded-lg">
                        <div className="text-sm font-medium">
                          {receipt.charity?.charity_name ?? "Unknown Charity"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Receipt #{receipt.receipt_number} •{" "}
                          {new Date(receipt.donation_date).toLocaleDateString()}
                        </div>
                        {/* <div className="text-xs">
                          Donor: {receipt.donor?.first_name ?? "Anonymous"}{" "}
                          {receipt.donor?.last_name ?? ""} (
                          {receipt.donor?.email ?? "No email provided"})
                        </div> */}
                        <div className="text-xs">
                          Amount: ${receipt.fiat_amount.toFixed(2)}
                        </div>
                        <button
                          className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
                          onClick={() => downloadReceipt(receipt.id)}
                        >
                          <Download size={14} /> Download PDF
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <button
                type="button"
                className="border px-4 py-2 rounded"
                onClick={onClose}
              >
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
