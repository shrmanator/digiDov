"use server";

import prisma from "@/lib/prisma";

/**
 * Interface for the input required to create a donation receipt.
 */
export interface DonationReceiptInput {
  // Optionally provide a custom receipt number; otherwise, a default is used.
  receiptNumber?: string;
  // Donation date as an ISO string (e.g., "2025-02-26T18:00:00.000Z").
  donationDate: string;
  // The fiat amount (in CAD) representing the donation's fair market value.
  fiatAmount: number;
  // Transaction hash (useful for tracking crypto donations).
  transactionHash: string;
  // Jurisdiction for the receipt; defaults to "CRA".
  jurisdiction?: "CRA" | "IRS";
  // Additional details specific to the jurisdiction stored as JSON.
  jurisdictionDetails?: any;
  // Optional charity ID to associate this receipt with a charity.
  charityId?: string;
  // Optional donor ID to associate this receipt with a donor.
  donorId?: string;
}

/**
 * Creates a new donation receipt in the database.
 *
 * For demonstration purposes, if no receipt number is provided,
 * "cra-001" is used by default. In production, you'll likely generate
 * a unique receipt number dynamically.
 *
 * @param data - DonationReceiptInput object containing receipt details.
 * @returns The newly created donation receipt record.
 */
export async function createDonationReceipt(data: DonationReceiptInput) {
  // Use a default receipt number if not provided.
  const receiptNumber = data.receiptNumber || "cra-001";
  // Default jurisdiction is CRA.
  const jurisdiction = data.jurisdiction || "CRA";

  // Create the donation receipt record in the database.
  const newReceipt = await prisma.donation_receipt.create({
    data: {
      receipt_number: receiptNumber,
      donation_date: new Date(data.donationDate),
      fiat_amount: data.fiatAmount,
      transaction_hash: data.transactionHash,
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
 * Retrieves the next receipt number for the given jurisdiction.
 * Uses a separate `receipt_counter` model to safely increment the counter.
 * The receipt number is formatted as, for example, "cra-001".
 */
export async function getNextReceiptNumber(
  jurisdiction: "CRA" | "IRS"
): Promise<string> {
  // Use a transaction to safely increment the counter.
  const result = await prisma.$transaction(async (tx) => {
    // Try to fetch the counter for the given jurisdiction.
    const counterRecord = await tx.donation_receipt_counter.findUnique({
      where: { jurisdiction },
    });

    let newCounter: number;
    if (counterRecord) {
      newCounter = counterRecord.counter + 1;
      await tx.donation_receipt_counter.update({
        where: { jurisdiction },
        data: { counter: newCounter },
      });
    } else {
      // If no counter exists for this jurisdiction, create one starting at 1.
      newCounter = 1;
      await tx.donation_receipt_counter.create({
        data: {
          jurisdiction,
          counter: newCounter,
        },
      });
    }
    // Format the receipt number, e.g., "cra-001".
    return `${jurisdiction.toLowerCase()}-${String(newCounter).padStart(
      3,
      "0"
    )}`;
  });

  return result;
}

// Additional receipt actions (e.g., update, retrieve, delete) can be added below.
