"use client";

import { useEffect, useState } from "react";
import { Download, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DonationReceipt } from "@/app/types/receipt";
import {
  getDonationReceiptPdf,
  getDonationReceipts,
} from "@/app/actions/receipts";

export default function DonationReceiptsList() {
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    setLoading(true);
    const fetchedReceipts = await getDonationReceipts();
    setReceipts(fetchedReceipts);
    setLoading(false);
  }

  const downloadReceipt = async (receiptId: string) => {
    const pdfBase64 = await getDonationReceiptPdf(receiptId);
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = `receipt-${receiptId}.pdf`;
    link.click();
  };

  if (loading && receipts.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        Fetching donation receipts...
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No donation receipts found.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {loading
        ? receipts.map((receipt) => (
            <Card key={receipt.id} className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-8 w-28 mt-2" />
              </div>
            </Card>
          ))
        : receipts.map((receipt) => (
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
                    {receipt.charity?.charity_name || "Unknown Charity"}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(receipt.donation_date).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-2 space-y-3">
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    Donor: {receipt.donor?.first_name ?? "Anonymous"}{" "}
                    {receipt.donor?.last_name ?? ""}
                  </p>

                  {receipt.donor?.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{receipt.donor.email}</span>
                    </div>
                  )}

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
  );
}
