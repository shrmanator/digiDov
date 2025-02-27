import { NextResponse } from "next/server";
import Web3 from "web3";
import prisma from "@/lib/prisma";
import { createDonationReceipt } from "@/app/actions/receipts";
import {
  RawDonationEventData,
  enrichDonationEvent,
  extractDonationEventFromPayload,
} from "@/utils/donation-event-helpers";
import { convertWeiToFiat } from "@/utils/convert-wei-to-fiat";

const web3 = new Web3();

export async function POST(request: Request) {
  console.log(`[START] Method: POST, URL: ${request.url}`);

  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);

    // Verify signature using the raw body text.
    console.log("Verifying signature...");
    const secret = process.env.MORALIS_STREAM_SECRET_KEY;
    if (!secret) throw new Error("Missing MORALIS_STREAM_SECRET_KEY");
    const providedSignature = request.headers.get("x-signature");
    if (!providedSignature) throw new Error("Signature not provided");
    const generatedSignature = web3.utils.sha3(bodyText + secret);
    if (generatedSignature !== providedSignature) {
      throw new Error("Invalid Signature");
    }

    console.log("Received webhook body:", JSON.stringify(body));

    // Only process confirmed transactions.
    const { confirmed, block, chainId } = body;
    if (!confirmed) {
      console.log("Unconfirmed transaction ignored.");
      return NextResponse.json(
        { message: "Unconfirmed transaction ignored" },
        { status: 200 }
      );
    }

    // Extract raw DonationForwarded event data from the logs.
    const rawEvent: RawDonationEventData | null =
      extractDonationEventFromPayload(body);
    if (!rawEvent) {
      console.log("No DonationForwarded event found.");
      return NextResponse.json(
        { message: "No DonationForwarded event found." },
        { status: 200 }
      );
    }
    // Enrich the raw event data with the transaction hash from the first tx (if available).
    const donationEvent = enrichDonationEvent(
      rawEvent,
      body.txs && body.txs.length > 0 ? body.txs[0].hash : ""
    );
    console.log(
      "Extracted enriched DonationForwarded event data:",
      donationEvent
    );

    // Use the block's timestamp (in seconds) as the donation date.
    const donationTimestamp = parseInt(block.timestamp, 10);
    const donationDate = new Date(donationTimestamp * 1000).toISOString();

    // Convert the Wei amounts to fiat (CAD).
    const fiatAmount = await convertWeiToFiat(
      donationEvent.fullAmount,
      donationTimestamp,
      "cad",
      chainId
    );
    const netFiatAmount = await convertWeiToFiat(
      donationEvent.netAmount,
      donationTimestamp,
      "cad",
      chainId
    );
    const feeFiatAmount = await convertWeiToFiat(
      donationEvent.fee,
      donationTimestamp,
      "cad",
      chainId
    );

    // Look up donor and charity records in the database using addresses from the event.
    const donorRecord = await prisma.donor.findUnique({
      where: { wallet_address: donationEvent.donor.toLowerCase() },
    });
    const charityRecord = await prisma.charity.findUnique({
      where: { wallet_address: donationEvent.charity.toLowerCase() },
    });
    console.log("Donor Record:", donorRecord);
    console.log("Charity Record:", charityRecord);
    if (!donorRecord || !charityRecord) {
      throw new Error("Donor or Charity record not found");
    }

    // Create the donation receipt using the extracted and converted event data.
    const receipt = await createDonationReceipt({
      donorId: donorRecord.id,
      charityId: charityRecord.id,
      donationDate,
      fiatAmount, // Full donation amount in fiat (converted from Wei).
      transactionHash: donationEvent.transactionHash,
      jurisdiction: "CRA", // Assuming CRA for now.
      jurisdictionDetails: {
        blockNumber: block.number,
        chainId,
        netAmount: netFiatAmount, // Net donation amount in fiat.
        fee: feeFiatAmount, // Fee in fiat.
      },
    });

    console.log("Donation receipt created:", receipt);

    return NextResponse.json(
      {
        message: "Webhook processed and donation receipt created successfully",
        receipt,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    console.log("Error:", errorMessage);
    return NextResponse.json(
      { message: "Failed to process webhook", error: errorMessage },
      { status: 500 }
    );
  }
}
