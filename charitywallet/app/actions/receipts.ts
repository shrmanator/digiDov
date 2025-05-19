"use server";

import prisma from "@/lib/prisma";
import { Prisma, DonationReceipt, Charity, Donor } from "@prisma/client";
import type { ReceiptDTO } from "../types/receipt";
import { generateDonationReceiptPDF } from "@/utils/generate-donation-receipt";
import { getChainName } from "../types/chains";

/**
 * 1) The shared “include” fragment for Prisma.
 */
const baseInclude: Prisma.DonationReceiptInclude = {
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
 */
function mapReceipt(
  r: DonationReceipt & { charity: Charity | null; donor: Donor | null }
): ReceiptDTO {
  return {
    id: r.id,
    receipt_number: r.receipt_number,
    donation_date: r.donation_date.toISOString(),
    fiat_amount: r.fiat_amount,
    crypto_amount_wei: r.crypto_amount_wei,
    usdc_sent: r.usdc_sent?.toString() ?? null,
    transaction_hash: r.transaction_hash,
    chainId: r.chainId,
    chain: getChainName(r.chainId),
    jurisdiction: r.jurisdiction,
    jurisdiction_details: r.jurisdiction_details,
    created_at: r.created_at,
    updated_at: r.updated_at,
    charity: r.charity
      ? {
          charity_name: r.charity.charity_name,
          registration_number: r.charity.registration_number,
          charity_sends_receipt: r.charity.charity_sends_receipt,
        }
      : null,
    charity_name: r.charity?.charity_name ?? null,
    donor: r.donor
      ? {
          first_name: r.donor.first_name,
          last_name: r.donor.last_name,
          email: r.donor.email,
        }
      : null,
  };
}
): ReceiptDTO {
  return {
    id: r.id,
    receipt_number: r.receipt_number,
    donation_date: r.donation_date.toISOString(),
    fiat_amount: r.fiat_amount,
    crypto_amount_wei: r.crypto_amount_wei,
    usdc_sent: r.usdc_sent?.toString() ?? null,
    transaction_hash: r.transaction_hash,
    chain: getChainName(r.chainId),
    charity: r.charity
      ? {
          charity_name: r.charity.charity_name,
          registration_number: r.charity.registration_number,
          charity_sends_receipt: r.charity.charity_sends_receipt,
        }
      : null,
    charity_name: r.charity?.charity_name ?? null,
    donor: r.donor
      ? {
          first_name: r.donor.first_name,
          last_name: r.donor.last_name,
          email: r.donor.email,
        }
      : null,
  };
}

/**
 * 3) Generic fetch + map pipeline.
 */
async function fetchReceipts(
  where: Prisma.DonationReceiptWhereInput
): Promise<ReceiptDTO[]> {
  const records = await prisma.donationReceipt.findMany({
    where,
    orderBy: { donation_date: "desc" },
    include: baseInclude,
  });
  return records.map(mapReceipt);
}

/**
 * 4a) Public API: receipts for a given donor.
 */
export async function getDonationReceiptsForDonor(
  walletAddress: string
): Promise<ReceiptDTO[]> {
  return fetchReceipts({ donor: { wallet_address: { equals: walletAddress.toLowerCase(), mode: "insensitive" } } });
}

/**
 * 4b) Public API: receipts for a given charity.
 */
export async function getDonationReceiptsForCharity(
  walletAddress: string
): Promise<ReceiptDTO[]> {
  return fetchReceipts({ charity: { wallet_address: walletAddress } });
}

/**
 * Retrieves a donation receipt by its ID, generates a PDF, and returns it as a Base64 string.
 */
export async function getDonationReceiptPdf(
  receiptId: string
): Promise<string> {
  const receipt = await prisma.donationReceipt.findUnique({
    where: { id: receiptId },
    include: { charity: true, donor: true },
  });
  if (!receipt) throw new Error("Donation receipt not found");
  const pdfBytes = await generateDonationReceiptPDF(receipt as DonationReceipt);
  return Buffer.from(pdfBytes).toString("base64");
}

/**
 * Increments the counter for a specific jurisdiction and returns the new value.
 */
async function incrementJurisdictionCounter(
  jurisdiction: "CRA" | "IRS",
  tx: Prisma.TransactionClient
): Promise<number> {
  const counter = await tx.donationReceiptCounter.findUnique({ where: { jurisdiction } });
  if (counter) {
    const next = counter.counter + 1;
    await tx.donationReceiptCounter.update({ where: { jurisdiction }, data: { counter: next } });
    return next;
  }
  await tx.donationReceiptCounter.create({ data: { jurisdiction, counter: 1 } });
  return 1;
}

/**
 * Formats a jurisdiction and counter into a receipt number string.
 */
function formatReceiptNumber(jurisdiction: string, count: number): string {
  return `${jurisdiction.toLowerCase()}-${String(count).padStart(3, "00")}`;
}

/**
 * Retrieves and increments the receipt counter, returning a formatted receipt number.
 */
export async function getNextReceiptNumber(
  jurisdiction: "CRA" | "IRS"
): Promise<string> {
  const count = await prisma.$transaction((tx) => incrementJurisdictionCounter(jurisdiction, tx));
  return formatReceiptNumber(jurisdiction, count);
}

/**
 * Creates a new donation receipt in the database.
 */
export async function createDonationReceipt(
  data: Omit<ReceiptDTO, "id" | "created_at" | "updated_at" | "charity" | "donor" | "charity_name" | "chain">
): Promise<DonationReceipt> {
  // Map DTO input to Prisma create data
  const {
    donation_date,
    fiat_amount,
    crypto_amount_wei,
    usdc_sent,
    transaction_hash,
    chainId,
    jurisdiction,
    jurisdiction_details,
    charity_id,
    donor_id,
  } = data;

  const donationDate = typeof donation_date === 'string' ? new Date(donation_date) : donation_date;

  return prisma.donationReceipt.create({
    data: {
      donation_date: donationDate,
      fiat_amount,
      crypto_amount_wei,
      usdc_sent: usdc_sent != null ? BigInt(usdc_sent) : undefined,
      transaction_hash,
      chainId,
      jurisdiction,
      jurisdiction_details,
      charity_id,
      donor_id,
    },
  });
}

/**
 * Generates a donation receipt PDF and returns it as a base64 string.
 */
export async function handleDonationReceipt(
  receiptData: DonationReceipt
): Promise<string> {(
  receiptData: DonationReceipt
): Promise<string> {
  const pdfBytes = await generateDonationReceiptPDF(receiptData);
  return Buffer.from(pdfBytes).toString("base64");
}
