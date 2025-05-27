"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Download, Copy, Check } from "lucide-react";
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
import { DonationReceiptDto } from "@/app/types/receipt";
import { useLogin } from "@/hooks/use-thirdweb-headless-login";

// Helper: are two dates the same calendar day?
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper: was receiptDate “yesterday” relative to today?
function isYesterday(receiptDate: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(receiptDate, yesterday);
}

// Group receipts into “Today”, “Yesterday”, or locale date string
function groupReceiptsByDate(receipts: DonationReceiptDto[]) {
  const grouped: Record<string, DonationReceiptDto[]> = {};
  const today = new Date();
  receipts.forEach((r) => {
    const d = new Date(r.donation_date);
    let label: string;
    if (isSameDay(d, today)) label = "Today";
    else if (isYesterday(d, today)) label = "Yesterday";
    else label = d.toLocaleDateString();
    (grouped[label] ||= []).push(r);
  });
  return grouped;
}

// Truncate a hex hash like "0xabcdef1234567890" → "0xabc…7890"
function truncateHash(hash: string) {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
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
  const [receipts, setReceipts] = useState<DonationReceiptDto[]>([]);
  const [loading, setLoading] = useState(true);
  // track which receipt hash was just copied
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDonationReceiptsForDonor(walletAddress);
      const sorted = data.sort(
        (a, b) =>
          new Date(b.donation_date).getTime() -
          new Date(a.donation_date).getTime()
      );
      setReceipts(sorted);
    } catch (err) {
      console.error("Error fetching donation receipts:", err);
    }
    setLoading(false);
  }, [walletAddress]);

  useEffect(() => {
    if (open && walletAddress) {
      fetchReceipts();
    }
  }, [open, walletAddress, fetchReceipts]);

  const downloadReceipt = async (id: string) => {
    try {
      const pdfBase64 = await getDonationReceiptPdf(id);
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `receipt-${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("Error downloading receipt PDF:", err);
    }
  };

  // copy handler: copy hash and trigger checkmark
  const handleCopy = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const grouped =
    !loading && receipts.length > 0 ? groupReceiptsByDate(receipts) : {};

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Donation Tax Receipts</DrawerTitle>
            <DrawerDescription>View your tax receipts.</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0 max-h-[300px] overflow-y-auto">
            {loading ? (
              <ul className="space-y-4">
                {[...Array(1)].map((_, i) => (
                  <li key={i} className="p-3 border rounded-lg">
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
              Object.entries(grouped).map(([dateLabel, list]) => (
                <div key={dateLabel} className="mb-4">
                  <h3 className="text-sm font-bold mb-2">{dateLabel}</h3>
                  <ul className="space-y-4">
                    {list.map((r) => {
                      const canDownload =
                        r.charity?.charity_sends_receipt === false;
                      const isCopied = copiedId === r.id;

                      return (
                        <li key={r.id} className="p-3 border rounded-lg">
                          {/* Charity name */}
                          <div className="text-sm font-medium">
                            {r.charity_name ?? "Unknown Charity"}
                          </div>

                          {canDownload ? (
                            <>
                              <div className="text-xs text-gray-500">
                                Receipt #{r.receipt_number} •{" "}
                                {new Date(r.donation_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                Amount: ${r.fiat_amount.toFixed(2)}
                              </div>
                              <div className="text-xs">
                                Network: {r.chain ?? "Unknown"}
                              </div>
                              <div className="text-xs flex items-center gap-1">
                                Hash:
                                <button
                                  onClick={() =>
                                    handleCopy(r.id, r.transaction_hash)
                                  }
                                  className="font-mono underline text-blue-600 flex items-center gap-1"
                                >
                                  {isCopied ? (
                                    <Check size={12} />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                  {truncateHash(r.transaction_hash)}
                                </button>
                              </div>
                              <button
                                type="button"
                                className="mt-2 flex items-center gap-1 text-blue-600 text-sm"
                                onClick={() => downloadReceipt(r.id)}
                              >
                                <Download size={14} /> Download PDF
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-xs">
                                Date:{" "}
                                {new Date(r.donation_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                Amount: ${r.fiat_amount.toFixed(2)}
                              </div>
                              <div className="text-xs">
                                Network: {r.chain ?? "Unknown"}
                              </div>
                              <div className="text-xs flex items-center gap-1">
                                Hash:
                                <button
                                  onClick={() =>
                                    handleCopy(r.id, r.transaction_hash)
                                  }
                                  className="font-mono underline text-blue-600 flex items-center gap-1"
                                >
                                  {isCopied ? (
                                    <Check size={12} />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                  {truncateHash(r.transaction_hash)}
                                </button>
                              </div>
                            </>
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
