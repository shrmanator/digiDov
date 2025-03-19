"use server";

import prisma from "@/lib/prisma";
import { generateDonationReceiptPDF } from "@/utils/donation-receipt/generate-donation-receipt";
import { Prisma, donation_receipt, charity, donor } from "@prisma/client";
import { DonationReceipt } from "../types/receipt";

/**
 * Retrieves all donation receipts, including related charity and donor details.
 */
export async function getDonationReceipts(
  walletAddress: string
): Promise<DonationReceipt[]> {
  const receipts = await prisma.donation_receipt.findMany({
    where: {
      charity: {
        wallet_address: walletAddress, // Filter by wallet address
      },
    },
    orderBy: { donation_date: "desc" },
    include: {
      charity: {
        select: {
          charity_name: true,
          registration_number: true,
        },
      },
      donor: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });

  return receipts.map((receipt) => ({
    ...receipt,
    donation_date: receipt.donation_date.toISOString(),
    charity: receipt.charity ?? null,
    donor: receipt.donor ?? null,
  }));
}

/**
 * Retrieves a donation receipt by its ID, generates a PDF, and returns it as a Base64 string.
 */
export async function getDonationReceiptPdf(
  receiptId: string
): Promise<string> {
  const receipt = await prisma.donation_receipt.findUnique({
    where: { id: receiptId },
    include: {
      charity: true,
      donor: true,
    },
  });

  if (!receipt) {
    throw new Error("Donation receipt not found");
  }

  // Ensure `date_of_issue` is present
  const receiptData: donation_receipt & {
    charity?: charity | null;
    donor?: donor | null;
    date_of_issue: string;
  } = {
    ...receipt,
    date_of_issue: receipt.donation_date.toISOString(),
  };

  const pdfBytes = await generateDonationReceiptPDF(receiptData);
  return Buffer.from(pdfBytes).toString("base64");
}

/**
 * Increments the counter for a specific jurisdiction and returns the new value.
 */
async function incrementJurisdictionCounter(
  jurisdiction: "CRA" | "IRS",
  tx: Prisma.TransactionClient
): Promise<number> {
  const counterRecord = await tx.donation_receipt_counter.findUnique({
    where: { jurisdiction },
  });

  if (counterRecord) {
    const newCounter = counterRecord.counter + 1;
    await tx.donation_receipt_counter.update({
      where: { jurisdiction },
      data: { counter: newCounter },
    });
    return newCounter;
  } else {
    await tx.donation_receipt_counter.create({
      data: { jurisdiction, counter: 1 },
    });
    return 1;
  }
}

/**
 * Formats a jurisdiction and counter into a receipt number string.
 */
function formatReceiptNumber(jurisdiction: string, counter: number): string {
  return `${jurisdiction.toLowerCase()}-${String(counter).padStart(3, "0")}`;
}

/**
 * Retrieves and increments the receipt counter for the given jurisdiction,
 * returning a formatted receipt number (e.g., "cra-001").
 */
export async function getNextReceiptNumber(
  jurisdiction: "CRA" | "IRS"
): Promise<string> {
  const newCounter = await prisma.$transaction((tx) =>
    incrementJurisdictionCounter(jurisdiction, tx)
  );

  return formatReceiptNumber(jurisdiction, newCounter);
}

/**
 * Creates a new donation receipt in the database.
 * If no receipt number is provided, one will be generated.
 */
export async function createDonationReceipt(
  data: Omit<donation_receipt, "id" | "created_at" | "updated_at">
): Promise<donation_receipt> {
  const jurisdiction = data.jurisdiction || "CRA";
  const receiptNumber =
    data.receipt_number || (await getNextReceiptNumber(jurisdiction));

  return prisma.donation_receipt.create({
    data: {
      receipt_number: receiptNumber,
      donation_date: new Date(data.donation_date),
      fiat_amount: data.fiat_amount,
      crypto_amount_wei: data.crypto_amount_wei,
      transaction_hash: data.transaction_hash,
      chainId: data.chainId,
      jurisdiction,
      jurisdiction_details: data.jurisdiction_details ?? Prisma.JsonNull,
      charity_id: data.charity_id,
      donor_id: data.donor_id,
    },
  });
}

/**
 * Generates a donation receipt PDF and returns it as a base64 string.
 */
export async function handleDonationReceipt(
  receiptData: donation_receipt
): Promise<string> {
  const pdfBytes = await generateDonationReceiptPDF(receiptData);
  return Buffer.from(pdfBytes).toString("base64");
}
