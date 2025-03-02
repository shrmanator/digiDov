"use server";

import prisma from "@/lib/prisma";
import { generateDonationReceiptPDF } from "@/utils/donation-receipt/generate-donation-receipt";
import { donation_receipt } from "@prisma/client";

/**
 * Interface for the input required to create a donation receipt.
 */
export interface DonationReceiptInput {
  // Optionally provide a custom receipt number; otherwise, one will be generated.
  receiptNumber?: string;
  // Donation date as an ISO string (e.g., "2025-02-26T18:00:00.000Z").
  donationDate: string;
  // The fiat amount (in CAD) representing the donation's fair market value.
  fiatAmount: number;
  // The crypto amount (in WEI) representing the donation's original value.
  cryptoAmountWei: bigint;
  // Transaction hash (useful for tracking crypto donations).
  transactionHash: string;
  // Jurisdiction for the receipt; defaults to "CRA".
  jurisdiction?: "CRA" | "IRS";
  // Additional details specific to the jurisdiction stored as JSON.
  jurisdictionDetails?: any;
  // The blockchain chain identifier (e.g., "0x89" for Polygon, "0x1" for Ethereum).
  chainId: string;
  // Optional charity ID to associate this receipt with a charity.
  charityId?: string;
  // Optional donor ID to associate this receipt with a donor.
  donorId?: string;
}

export async function getDonationReceipts() {
  return await prisma.donation_receipt.findMany({
    orderBy: { donation_date: "desc" },
    include: {
      charity: {
        select: {
          charity_name: true,
          registered_office_address: true,
          registration_number: true,
          contact_name: true,
        },
      },
      donor: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
          address: true,
        },
      },
    },
  });
}

/**
 * Retrieves a donation receipt by its ID, generates a PDF using pdf‑lib,
 * and returns the PDF data as a Base64 encoded string.
 *
 * @param receiptId - The ID of the donation receipt.
 * @returns Base64 encoded PDF string.
 */
export async function getDonationReceiptPdf(
  receiptId: string
): Promise<string> {
  // Fetch the complete receipt data (with related charity and donor details)
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

  const pdfBytes = await generateDonationReceiptPDF(receipt);
  return Buffer.from(pdfBytes).toString("base64");
}

/**
 * Increments the counter for a specific jurisdiction and returns the new value.
 * Creates a new counter starting at 1 if none exists.
 */
async function incrementJurisdictionCounter(
  jurisdiction: "CRA" | "IRS",
  tx: any
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
      data: {
        jurisdiction,
        counter: 1,
      },
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
  const newCounter = await prisma.$transaction(async (tx) => {
    return incrementJurisdictionCounter(jurisdiction, tx);
  });

  return formatReceiptNumber(jurisdiction, newCounter);
}

/**
 * Creates a new donation receipt in the database.
 *
 * If no receipt number is provided, the function will generate one
 * dynamically using getNextReceiptNumber.
 *
 * @param data - DonationReceiptInput object containing receipt details.
 * @returns The newly created donation receipt record.
 */
export async function createDonationReceipt(data: DonationReceiptInput) {
  const jurisdiction = data.jurisdiction || "CRA";

  // Generate a receipt number if not provided.
  const receiptNumber =
    data.receiptNumber || (await getNextReceiptNumber(jurisdiction));

  const newReceipt = await prisma.donation_receipt.create({
    data: {
      receipt_number: receiptNumber,
      donation_date: new Date(data.donationDate),
      fiat_amount: data.fiatAmount,
      crypto_amount_wei: data.cryptoAmountWei,
      transaction_hash: data.transactionHash,
      chainId: data.chainId,
      jurisdiction,
      jurisdiction_details: data.jurisdictionDetails ?? null,
      // If a charityId is provided, connect the record to the charity.
      charity: data.charityId ? { connect: { id: data.charityId } } : undefined,
      // If a donorId is provided, connect the record to the donor.
      donor: data.donorId ? { connect: { id: data.donorId } } : undefined,
    },
  });

  return newReceipt;
}

/**
 * Generates a donation receipt PDF and returns it as a base64 string.
 */
export async function handleDonationReceipt(receiptData: any): Promise<string> {
  const pdfBytes = await generateDonationReceiptPDF(receiptData);

  // Convert to Base64 for safe transfer to the frontend
  return Buffer.from(pdfBytes).toString("base64");
}
