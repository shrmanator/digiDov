import { NextResponse } from "next/server";
import axios from "axios";
import { getCoingeckoIdFromChainId } from "@/utils/get-coingecko-id-from-chain-id";

// Simple in-memory cache (for demonstration purposes)
const cache: { [key: string]: { data: unknown; expiry: number } } = {};
const CACHE_TTL = 1000 * 60 * 5; // Cache for 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId");
  const date = searchParams.get("date");

  if (!chainId || !date) {
    return NextResponse.json(
      { error: "chainId and date are required" },
      { status: 400 }
    );
  }

  const tokenId = getCoingeckoIdFromChainId(chainId);
  if (!tokenId) {
    return NextResponse.json(
      { error: `Unsupported chainId: ${chainId}` },
      { status: 400 }
    );
  }

  // Construct the CoinGecko API URL (date should be in "dd-mm-yyyy" format)
  const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${date}`;
  const cacheKey = `${tokenId}-${date}`;
  const now = Date.now();

  // Check if we have a valid cached value
  if (cache[cacheKey] && cache[cacheKey].expiry > now) {
    return NextResponse.json(cache[cacheKey].data);
  }

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Cache the response data
    cache[cacheKey] = { data, expiry: now + CACHE_TTL };

    return NextResponse.json(data);
  } catch (error) {
    // Use axios.isAxiosError to type-narrow and log the detailed error info
    if (axios.isAxiosError(error)) {
      console.error(
        `Error fetching historical price for URL ${apiUrl}:`,
        error.response?.data ?? error.message
      );
    } else {
      console.error("Unexpected error fetching historical price:", error);
    }
    return NextResponse.json(
      { error: "Error fetching historical price" },
      { status: 500 }
    );
  }
}
