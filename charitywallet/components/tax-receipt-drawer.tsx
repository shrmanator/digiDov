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

// Import your server-side functions
import {
  getDonationReceipts,
  getDonationReceiptPdf,
} from "@/app/actions/receipts";
import { DonationReceipt } from "@/app/types/receipt";

interface TaxReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TaxReceiptDrawer({ open, onClose }: TaxReceiptDrawerProps) {
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
      const data = await getDonationReceipts();
      setReceipts(data);
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

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Donation Receipts</DrawerTitle>
            <DrawerDescription>
              View and download your tax receipts.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
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
              <ul className="space-y-4">
                {receipts.map((receipt) => (
                  <li key={receipt.id} className="p-3 border rounded-lg">
                    <div className="text-sm font-medium">
                      {receipt.charity?.charity_name ?? "Unknown Charity"} (
                      {receipt.charity?.registration_number ?? "N/A"})
                    </div>
                    <div className="text-xs text-gray-500">
                      Receipt #{receipt.receipt_number} •{" "}
                      {new Date(receipt.donation_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      Donor: {receipt.donor?.first_name ?? "Anonymous"}{" "}
                      {receipt.donor?.last_name ?? ""} (
                      {receipt.donor?.email ?? "No email provided"})
                    </div>
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
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <button className="border px-4 py-2 rounded" onClick={onClose}>
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
