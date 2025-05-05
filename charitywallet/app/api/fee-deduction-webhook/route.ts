// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import Web3 from "web3";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  createDonationReceipt,
  getNextReceiptNumber,
} from "@/app/actions/receipts";
import {
  RawDonationEventData,
  enrichDonationEvent,
  extractDonationEventFromPayload,
} from "@/utils/donation-event-helpers";
import { generateDonationReceiptPDF } from "@/utils/generate-donation-receipt";
import { convertWeiToFiat } from "@/utils/convert-wei-to-fiat";

import type { DonationReceipt } from "@/app/types/receipt";
import {
  notifyDonorWithoutReceipt,
  notifyCharityWithCsv,
  notifyDonorWithReceipt,
  notifyCharityAboutDonation,
} from "@/app/actions/email";

const web3 = new Web3();

export async function POST(request: Request) {
  try {
    // 1. Verify signature
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const secret = process.env.MORALIS_STREAM_SECRET_KEY_7810049!;
    const providedSig = request.headers.get("x-signature");
    if (!providedSig || web3.utils.sha3(bodyText + secret) !== providedSig) {
      throw new Error("Invalid signature");
    }

    // 2. Only confirmed transactions
    const { confirmed, block, chainId } = body;
    if (!confirmed) {
      return NextResponse.json(
        { message: "Unconfirmed ignored" },
        { status: 200 }
      );
    }

    // 3. Extract & enrich event
    const raw: RawDonationEventData | null =
      extractDonationEventFromPayload(body);
    if (!raw) throw new Error("No DonationForwarded event");
    const event = enrichDonationEvent(raw, body.txs?.[0]?.hash || "");

    // 4. Compute timestamps & amounts
    const ts = parseInt(block.timestamp, 10);
    const donationDate = new Date(ts * 1000);
    const fiat = await convertWeiToFiat(event.fullAmount, ts, "cad", chainId);
    const netFiat = await convertWeiToFiat(event.netAmount, ts, "cad", chainId);
    const feeFiat = await convertWeiToFiat(event.fee, ts, "cad", chainId);

    // 5. Load donor & charity from DB
    const donor = await prisma.donor.findUnique({
      where: { wallet_address: event.donor.toLowerCase() },
    });
    const charity = await prisma.charity.findUnique({
      where: { wallet_address: event.charity.toLowerCase() },
    });
    if (!donor || !charity) throw new Error("Donor or charity not found");
    console.log("Donor and charity found.", charity);
    // 6. Mint receipt & save, but ignore duplicates
    let receipt;
    try {
      const receiptNumber = await getNextReceiptNumber("CRA");
      receipt = await createDonationReceipt({
        donor_id: donor.id,
        charity_id: charity.id,
        receipt_number: receiptNumber,
        donation_date: donationDate,
        fiat_amount: fiat,
        crypto_amount_wei: BigInt(event.fullAmount),
        chainId,
        transaction_hash: event.transactionHash,
        jurisdiction: "CRA",
        jurisdiction_details: {
          blockNumber: block.number,
          netAmount: netFiat,
          fee: feeFiat,
        },
      });
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        (e.meta?.target as string[]).includes("transaction_hash")
      ) {
        console.warn(
          `Duplicate receipt exists for tx ${event.transactionHash}, ignoring.`
        );
        return NextResponse.json(
          { message: "Duplicate event ignored" },
          { status: 200 }
        );
      }
      throw e;
    }

    // 7. Generate PDF only if charity wants us to send PDF receipts
    if (!charity.charity_sends_receipt) {
      await generateDonationReceiptPDF(receipt);
    }

    // Build the DonationReceipt DTO for CSV helper
    const donationDto: DonationReceipt = {
      ...receipt,
      donation_date: receipt.donation_date.toISOString(),
      charity: {
        charity_name: charity.charity_name,
        registration_number: charity.registration_number,
      },
      donor: {
        first_name: donor.first_name,
        last_name: donor.last_name,
        email: donor.email!,
      },
    };

    // 8–9. Notify donor and charity
    if (charity.charity_sends_receipt) {
      console.log(
        `Charity ${charity.charity_name} sends receipts, notifying donor and charity.`
      );
      const donorRes = await notifyDonorWithoutReceipt({
        ...receipt,
        donor,
        charity,
      });
      if (!donorRes.success)
        throw new Error(`Donor notification failed: ${donorRes.error}`);

      const csvRes = await notifyCharityWithCsv(
        [donationDto],
        charity.contact_email!,
        charity.charity_name!
      );
      if (!csvRes.success)
        throw new Error(`Charity CSV notification failed: ${csvRes.error}`);
    } else {
      console.log(
        `Charity ${charity.charity_name} does not send receipts, notifying donor with PDF.`
      );

      const donorRes = await notifyDonorWithReceipt({
        ...receipt,
        donor,
        charity,
      });
      if (!donorRes.success)
        throw new Error(`Donor PDF notification failed: ${donorRes.error}`);

      const pdfRes = await notifyCharityAboutDonation({
        ...receipt,
        donor,
        charity,
      });
      if (!pdfRes.success)
        throw new Error(`Charity PDF notification failed: ${pdfRes.error}`);
    }

    // 10. Respond success
    return NextResponse.json(
      {
        message: "Webhook processed successfully",
        receipt: {
          ...receipt,
          crypto_amount_wei: receipt.crypto_amount_wei?.toString() ?? "0",
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorInfo =
      err instanceof Error ? err.stack ?? err.message : String(err);
    console.error("Webhook error:", errorInfo);

    return NextResponse.json(
      { message: "Failed processing webhook", error: errorInfo },
      { status: 500 }
    );
  }
}
