import { NextResponse } from "next/server";
import Web3 from "web3";

const web3 = new Web3();

export async function POST(request: Request) {
  console.log(`[START] Method: POST, URL: ${request.url}`);

  try {
    // Read the raw body text
    const bodyText = await request.text();
    // Parse the JSON body
    const body = JSON.parse(bodyText);

    // Verify signature using the raw body text
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

    const { confirmed } = body;
    if (!confirmed) {
      console.log("Unconfirmed transaction ignored.");
      return NextResponse.json(
        { message: "Unconfirmed transaction ignored" },
        { status: 200 }
      );
    }

    // Instead of forwarding the payload, we simply log and return it.
    console.log("Webhook payload printed above");

    return NextResponse.json(
      { message: "Webhook payload printed successfully", payload: body },
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
