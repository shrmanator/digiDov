"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
  getDonationReceiptsForDonor,
  getDonationReceiptPdf,
} from "@/app/actions/receipts";
import { DonationReceipt } from "@/app/types/receipt";
import { useLogin } from "@/hooks/use-thirdweb-headless-login";

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
  walletAddress: string;
}

export function TaxReceiptDrawer({
  open,
  onClose,
  walletAddress,
}: TaxReceiptDrawerProps) {
  const { login } = useLogin();
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDonationReceiptsForDonor(walletAddress);
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
  }, [walletAddress]);

  useEffect(() => {
    if (open && walletAddress) {
      fetchReceipts();
    }
  }, [open, walletAddress, fetchReceipts]);

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

  // If the user is not connected, show a sign in button
  if (!walletAddress) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm text-center p-4">
            <p>Please sign in to view your donation receipts.</p>
            <button
              type="button"
              className="border px-4 py-2 rounded mt-4"
              onClick={login}
            >
              Sign In
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Group receipts by date if not loading and receipts exist
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

          <div className="p-4 pb-0 max-h-[300px] overflow-y-auto">
            {loading ? (
              <ul className="space-y-4">
                {[...Array(1)].map((_, index) => (
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
              Object.keys(groupedReceipts).map((dateLabel) => (
                <div key={dateLabel} className="mb-4">
                  <h3 className="text-sm font-bold mb-2">{dateLabel}</h3>
                  <ul className="space-y-4">
                    {groupedReceipts[dateLabel].map((receipt) => {
                      const canDownload =
                        receipt.charity?.charity_sends_receipt === false;

                      return (
                        <li key={receipt.id} className="p-3 border rounded-lg">
                          <div className="text-sm font-medium">
                            {receipt.charity?.charity_name ?? "Unknown Charity"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Receipt #{receipt.receipt_number} •{" "}
                            {new Date(
                              receipt.donation_date
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs">
                            Amount: ${receipt.fiat_amount.toFixed(2)}
                          </div>

                          {canDownload ? (
                            <button
                              type="button"
                              className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
                              onClick={() => downloadReceipt(receipt.id)}
                            >
                              <Download size={14} /> Download PDF
                            </button>
                          ) : (
                            <div className="mt-2 text-sm italic text-gray-500">
                              This charity sends their own receipts.
                            </div>
                          )}
                        </li>
                      );
                    })}
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
