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
  notifyDonorWithReceipt,
  notifyDonorAdvantageTooHigh,
  notifyCharityWithCsv,
  notifyCharityAboutDonation,
} from "@/app/actions/email";
import { Prisma } from "@prisma/client";

const web3 = new Web3();

export async function POST(request: Request) {
  try {
    // 1. Verify signature
    const bodyText = await request.text();
    console.log("🦄 Moralis raw body text:", bodyText);

    const body = JSON.parse(bodyText);
    console.log("🦄 Moralis parsed payload:", JSON.stringify(body, null, 2));

    const secret = process.env.MORALIS_STREAM_SECRET_KEY_7810049!;
    const providedSig = request.headers.get("x-signature");
    if (!providedSig || web3.utils.sha3(bodyText + secret) !== providedSig) {
      throw new Error("Invalid signature");
    }

    // 2. Only confirmed transactions
    const { confirmed, block, chainId } = body;
    if (!confirmed) {
      console.log(
        `🦄 Ignoring unconfirmed tx ${body.txs?.[0]?.hash}, block ${block.number}`
      );
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
      convertWeiToFiat(event.fullAmount, ts, "cad"),
      convertWeiToFiat(event.netAmount, ts, "cad"),
      convertWeiToFiat(event.fee, ts, "cad"),
    ]);

    // 5. Load donor & charity from DB
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
        usdc_sent: BigInt(event.usdcSent),
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

    // 7. de minimis logic
    const donationAmount = fiat; // total FMV in CAD
    const advantage = charity.advantage_amount ?? 0; // advantage in CAD
    const deMinimisThreshold = Math.min(75, donationAmount * 0.1);

    const skipReceipt =
      charity.charity_sends_receipt || advantage > deMinimisThreshold;

    // 8. Generate PDF only if NOT skipped
    if (!skipReceipt) {
      await generateDonationReceiptPDF(receipt);
    }

    // 9. Build DonationReceipt DTO (for emails/CSV)
    const donationDto = {
      ...receipt,
      donation_date: receipt.donation_date.toISOString(),
      usdcSent: receipt.usdc_sent?.toString() ?? null,
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
    };

    // 10. Notify donor and charity, catching email errors
    if (charity.charity_sends_receipt) {
      // Charity sends their own receipt → notify donor “without receipt” + CSV
      try {
        await notifyDonorWithoutReceipt({ ...receipt, donor, charity });
      } catch (e) {
        console.error("Failed sending donor-without-receipt email", e);
      }

      const csvRow = {
        ...donationDto,
        donor_wallet_address: donor.wallet_address,
        donor_address: donor.address,
      };
      try {
        await notifyCharityWithCsv(
          [csvRow],
          charity.contact_email!,
          charity.charity_name!
        );
      } catch (e) {
        console.error("Failed sending charity CSV", e);
      }
    } else if (advantage > deMinimisThreshold) {
      // Advantage too high → send “no tax receipt” email + CSV
      try {
        await notifyDonorAdvantageTooHigh(
          receipt,
          donor,
          charity,
          advantage,
          deMinimisThreshold
        );
      } catch (e) {
        console.error("Failed sending advantage-too-high email", e);
      }

      const csvRow = {
        ...donationDto,
        donor_wallet_address: donor.wallet_address,
        donor_address: donor.address,
      };
      try {
        await notifyCharityWithCsv(
          [csvRow],
          charity.contact_email!,
          charity.charity_name!
        );
      } catch (e) {
        console.error("Failed sending charity CSV", e);
      }
    } else {
      // Advantage ≤ de minimis & charity does not send receipts → send standard receipt
      try {
        await notifyDonorWithReceipt({ ...receipt, donor, charity });
      } catch (e) {
        console.error("Failed sending donor-with-receipt email", e);
      }

      try {
        await notifyCharityAboutDonation({ ...receipt, donor, charity });
      } catch (e) {
        console.error("Failed sending charity-received-donation email", e);
      }
    }

    // 11. Respond success — convert BigInt fields to strings
    const safeReceipt = {
      ...receipt,
      donation_date: receipt.donation_date.toISOString(),
      crypto_amount_wei:
        receipt.crypto_amount_wei != null
          ? receipt.crypto_amount_wei.toString()
          : null,
      usdc_sent: receipt.usdc_sent != null ? receipt.usdc_sent.toString() : "0",
    };

    return NextResponse.json(
      {
        message: "Webhook processed successfully",
        receipt: safeReceipt,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { message: "Failed processing webhook", error: (err as Error).message },
      { status: 400 }
    );
  }
}
