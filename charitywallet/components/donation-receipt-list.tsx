"use client";

import { useEffect, useState } from "react";
import { Download, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonationReceipt } from "@/app/types/receipt";
import {
  getDonationReceiptPdf,
  getDonationReceipts,
} from "@/app/actions/receipts";

export default function DonationReceiptsList() {
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [groupedReceipts, setGroupedReceipts] = useState<
    Record<string, DonationReceipt[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    setLoading(true);
    const fetchedReceipts = await getDonationReceipts();
    setReceipts(fetchedReceipts);
    groupByDay(fetchedReceipts);
    setLoading(false);
  }

  // Groups receipts by the donation date (ignoring the time)
  function groupByDay(receipts: DonationReceipt[]) {
    const groups: Record<string, DonationReceipt[]> = {};
    receipts.forEach((receipt) => {
      const dateKey = new Date(receipt.donation_date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(receipt);
    });
    setGroupedReceipts(groups);
  }

  const downloadReceipt = async (receiptId: string) => {
    const pdfBase64 = await getDonationReceiptPdf(receiptId);
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = `receipt-${receiptId}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-4 text-muted-foreground">
        Fetching donation tax receipts...
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center p-4 text-muted-foreground">
        No donation tax receipts found.
      </div>
    );
  }

  // Sort dates so that the most recent date appears first
  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="p-4 space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          <h2 className="text-xl font-bold mb-2">
            {dateKey === new Date().toLocaleDateString() ? "Today" : dateKey}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedReceipts[dateKey].map((receipt) => (
              <Card
                key={receipt.id}
                className="shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium uppercase">
                    {receipt.donor?.first_name?.[0] ?? "A"}
                    {receipt.donor?.last_name?.[0] ?? ""}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {receipt.donor?.first_name} {receipt.donor?.last_name}
                    </CardTitle>
                    {receipt.donor?.email && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{receipt.donor.email}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {new Date(receipt.donation_date).toLocaleDateString()} at{" "}
                      {new Date(receipt.donation_date).toLocaleTimeString()}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 space-y-3">
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Amount:{" "}
                      <span className="font-semibold">
                        ${receipt.fiat_amount.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReceipt(receipt.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
