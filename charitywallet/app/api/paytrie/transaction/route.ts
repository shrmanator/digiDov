import { NextResponse } from "next/server";

interface TransactionRequestBody {
  quoteId: number;
  gasId: number;
  email: string;
  wallet: string;
  leftSideLabel: string;
  leftSideValue: number;
  rightSideLabel: string;
  ethCost?: string;
  vendorId?: number;
  useReferral?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: TransactionRequestBody = await request.json();

    // Forward the payload to PayTrie's transaction endpoint.
    const payTrieResponse = await fetch(
      "https://api.paytrie.com/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.PAYTRIE_API_KEY || "no api key",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await payTrieResponse.json();

    // Return the response from PayTrie, preserving the original status code.
    return NextResponse.json(data, { status: payTrieResponse.status });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your transaction." },
      { status: 500 }
    );
  }
}
