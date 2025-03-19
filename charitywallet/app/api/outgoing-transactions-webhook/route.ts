import { NextResponse } from "next/server";
import Web3 from "web3";
import { convertWeiToFiat } from "@/utils/convert-wei-to-fiat";
import {
  addCharityFundTransferToDb,
  getCharityByWalletAddress,
} from "@/app/actions/charities";

const web3 = new Web3();

export async function POST(request: Request) {
  console.log(
    `[START] Charity Fund Transfer Webhook: POST, URL: ${request.url}`
  );

  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);

    // Verify signature using the raw body text.
    console.log("Verifying signature...");
    const secret = process.env.MORALIS_STREAM_SECRET_KEY_7810049;
    if (!secret) throw new Error("Missing MORALIS_STREAM_SECRET_KEY_7810049");
    const providedSignature = request.headers.get("x-signature");
    if (!providedSignature) throw new Error("Signature not provided");
    const generatedSignature = web3.utils.sha3(bodyText + secret);
    if (generatedSignature !== providedSignature) {
      throw new Error("Invalid Signature");
    }

    console.log("Received webhook body:", JSON.stringify(body, null, 2));

    // Only process confirmed transactions.
    const { confirmed, block, chainId } = body;
    if (!confirmed) {
      console.log("Unconfirmed transaction ignored.");
      return NextResponse.json(
        { message: "Unconfirmed transaction ignored" },
        { status: 200 }
      );
    }

    // Ensure there's at least one transaction in the payload.
    if (!body.txs || body.txs.length === 0) {
      console.log("No transactions found in payload.");
      return NextResponse.json(
        { message: "No transactions found" },
        { status: 200 }
      );
    }

    // For charity fund transfers, we assume:
    // - The charity's wallet (fromAddress) is sending funds.
    // - The external destination wallet is given by toAddress.
    // - The first transaction in the txs array is used for logging.
    const tx = body.txs[0];
    const charityWallet = tx.fromAddress.toLowerCase();
    const destinationWallet = tx.toAddress; // External recipient wallet.
    const amountWei = tx.value; // Amount in wei.
    const transactionHash = tx.hash;

    // Use the block's timestamp for historical price conversion.
    const transferTimestamp = parseInt(block.timestamp, 10);

    // get the fiat equivalent (e.g., in CAD).
    const historicalFiatEquivalent = await convertWeiToFiat(
      amountWei,
      transferTimestamp,
      "cad",
      chainId
    );
    console.log("Fiat Equivalent:", historicalFiatEquivalent);

    const charity = await getCharityByWalletAddress(charityWallet);
    if (!charity) throw new Error("Charity not found for wallet address");
    const charityId = charity.id;

    const dbResponse = await addCharityFundTransferToDb({
      charityId,
      amountWei,
      destinationWallet,
      transactionHash,
      chainId,
      historicalPrice: historicalFiatEquivalent,
    });
    console.log("Log charity fund transfer response:", dbResponse);

    return NextResponse.json(
      {
        message: "Charity fund transfer logged successfully",
        log: dbResponse,
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
