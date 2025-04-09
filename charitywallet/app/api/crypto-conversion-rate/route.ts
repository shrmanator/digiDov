import { NextResponse } from "next/server";

// Define the mapping directly here.
const chainIdToCoingeckoId: Record<string, string> = {
  "0x1": "ethereum",
  "0x89": "matic-network",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId") || "";
  const fiat = searchParams.get("fiat") || "usd";

  // Convert chainId to hex if needed.
  const hexChainId = chainId.startsWith("0x")
    ? chainId
    : "0x" + parseInt(chainId, 10).toString(16);

  const coingeckoId = chainIdToCoingeckoId[hexChainId];
  if (!coingeckoId) {
    return NextResponse.json(
      { error: `No mapping found for chain ID: ${chainId}` },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=${fiat}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch conversion rate from CoinGecko");
    }
    const data = await res.json();
    const rate = data[coingeckoId]?.[fiat];
    if (rate === undefined) {
      throw new Error(`No conversion data for CoinGecko ID: ${coingeckoId}`);
    }
    return NextResponse.json({ conversionRate: rate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
