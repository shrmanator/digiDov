"use server";

import prisma from "@/lib/prisma";
import { generateDonationReceiptPDF } from "@/utils/generate-donation-receipt";
import { Prisma, donation_receipt, charity, donor } from "@prisma/client";
import { DonationReceipt } from "../types/receipt";
import { getChainName } from "../types/chains";

/**
 * 1) The shared “include” fragment for Prisma.
 *    Changes here flow through both queries.
 */
const baseInclude: Prisma.donation_receiptInclude = {
  charity: {
    select: {
      charity_name: true,
      registration_number: true,
      charity_sends_receipt: true,
    },
  },
  donor: {
    select: {
      first_name: true,
      last_name: true,
      email: true,
    },
  },
};

/**
 * 2) Map a raw Prisma record → our front-end DTO.
 *    Single Responsibility: only handles conversion.
 */
function mapReceipt(
  r: donation_receipt & {
    charity: {
      charity_name: string | null;
      registration_number: string | null;
      charity_sends_receipt: boolean;
    } | null;
    donor: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    } | null;
  }
): DonationReceipt {
  return {
    ...r, // id, receipt_number, fiat_amount, transaction_hash, etc.
    donation_date: r.donation_date.toISOString(),
    charity: r.charity,
    donor: r.donor,
    chain: getChainName(r.chainId),
    charity_name: r.charity?.charity_name ?? null,
    // transaction_hash is already there via the spread
  };
}

/**
 * 3) Generic fetch + map pipeline.
 *    Accepts any Prisma “where” filter.
 */
async function fetchReceipts(
  where: Prisma.donation_receiptWhereInput
): Promise<DonationReceipt[]> {
  const records = await prisma.donation_receipt.findMany({
    where,
    orderBy: { donation_date: "desc" },
    include: baseInclude,
  });
  return records.map(mapReceipt);
}

/**
 * 4a) Public API: receipts for a given donor.
 */
export function getDonationReceiptsForDonor(
  walletAddress: string
): Promise<DonationReceipt[]> {
  return fetchReceipts({
    donor: {
      wallet_address: {
        equals: walletAddress.toLowerCase(),
        mode: "insensitive",
      },
    },
  });
}

/**
 * 4b) Public API: receipts for a given charity.
 */
export function getDonationReceiptsForCharity(
  walletAddress: string
): Promise<DonationReceipt[]> {
  return fetchReceipts({
    charity: {
      wallet_address: walletAddress,
    },
  });
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
