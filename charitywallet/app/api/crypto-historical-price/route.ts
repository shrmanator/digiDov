// app/api/crypto-historical-price/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import { getCoingeckoIdFromChainId } from "@/utils/get-coingecko-id-from-chain-id";

export async function GET(request: Request) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId");
  const date = searchParams.get("date");
  const targetCurrency = searchParams.get("targetCurrency") || "usd";

  // Validate required parameters
  if (!chainId || !date) {
    return NextResponse.json(
      { error: "chainId and date are required" },
      { status: 400 }
    );
  }

  // Map the chainId to the corresponding CoinGecko token id
  const tokenId = getCoingeckoIdFromChainId(chainId);
  if (!tokenId) {
    return NextResponse.json(
      { error: `Unsupported chainId: ${chainId}` },
      { status: 400 }
    );
  }

  // Build the CoinGecko API URL (expecting the date in "dd-mm-yyyy" format)
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${date}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching historical price:", error);
    return NextResponse.json(
      { error: "Error fetching historical price" },
      { status: 500 }
    );
  }
}
