import { NextResponse } from "next/server";
import Web3 from "web3";
import prisma from "@/lib/prisma";

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

import {
  notifyDonorWithoutReceipt,
  notifyCharityWithCsv,
  notifyDonorWithReceipt,
  notifyCharityAboutDonation,
} from "@/app/actions/email";
import { Prisma } from "@prisma/client";
import { DonationReceiptDto } from "@/app/types/receipt";

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

    // 4. Compute timestamps & parallel fiat conversions
    const ts = parseInt(block.timestamp, 10);
    const [fiat, netFiat, feeFiat] = await Promise.all([
      convertWeiToFiat(event.fullAmount, ts, "cad", chainId),
      convertWeiToFiat(event.netAmount, ts, "cad", chainId),
      convertWeiToFiat(event.fee, ts, "cad", chainId),
    ]);

    // 5. Load full donor & charity from DB for notifications
    const donor = await prisma.donor.findUnique({
      where: { wallet_address: event.donor.toLowerCase() },
    });
    const charity = await prisma.charity.findUnique({
      where: { wallet_address: event.charity.toLowerCase() },
    });
    if (!donor || !charity) throw new Error("Donor or charity not found");

    // 6. Mint receipt & save, ignore duplicates
    let receipt;
    try {
      const receiptNumber = await getNextReceiptNumber("CRA");
      receipt = await createDonationReceipt({
        donor_id: donor.id,
        charity_id: charity.id,
        receipt_number: receiptNumber,
        donation_date: new Date(ts * 1000),
        fiat_amount: fiat,
        crypto_amount_wei: BigInt(event.fullAmount),
        usdc_sent: BigInt(event.usdcSent), // ← NEW FIELD
        chainId: String(chainId),
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

    // 7. Generate PDF only if charity opts out of their own receipts
    if (!charity.charity_sends_receipt) {
      await generateDonationReceiptPDF(receipt);
    }

    // 8. Build the DonationReceipt DTO
    const donationDto: DonationReceiptDto = {
      ...receipt,
      donation_date: receipt.donation_date.toISOString(),
      charity: {
        charity_name: charity.charity_name,
        registration_number: charity.registration_number,
        charity_sends_receipt: charity.charity_sends_receipt,
      },
      charity_name: charity.charity_name,
      donor: {
        first_name: donor.first_name,
        last_name: donor.last_name,
        email: donor.email!,
      },
      chain: chainId ? String(chainId) : null,
      usdcSent: receipt.usdc_sent?.toString() ?? null, // ← NEW FIELD
    };

    // 9. Notify donor and charity
    if (charity.charity_sends_receipt) {
      const donorRes = await notifyDonorWithoutReceipt({
        ...receipt,
        donor,
        charity,
      });
      if (!donorRes.success) throw new Error(donorRes.error);

      // ——— extend the row with wallet addresses ———
      const csvRow = {
        ...donationDto,
        donor_wallet_address: donor.wallet_address,
        donor_address: donor.address,
      };

      const csvRes = await notifyCharityWithCsv(
        [csvRow],
        charity.contact_email!,
        charity.charity_name!
      );
      if (!csvRes.success) throw new Error(csvRes.error);
    } else {
      const donorRes = await notifyDonorWithReceipt({
        ...receipt,
        donor,
        charity,
      });
      if (!donorRes.success) throw new Error(donorRes.error);

      const pdfRes = await notifyCharityAboutDonation({
        ...receipt,
        donor,
        charity,
      });
      if (!pdfRes.success) throw new Error(pdfRes.error);
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
    console.error("Webhook error:", err);
    return NextResponse.json(
      { message: "Failed processing webhook", error: (err as Error).message },
      { status: 500 }
    );
  }
}
