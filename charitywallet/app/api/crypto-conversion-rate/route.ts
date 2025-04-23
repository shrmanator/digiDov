import { NextResponse } from "next/server";

const chainIdToSymbol: Record<string, string> = {
  "0x1": "ETH",
  "0x89": "POL",
};

export async function GET(request: Request) {
  const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId") || "";
  const fiat = searchParams.get("fiat")?.toUpperCase() || "USD";

  // Normalize to hex
  const hexChainId = chainId.startsWith("0x")
    ? chainId
    : "0x" + parseInt(chainId, 10).toString(16);

  const symbol = chainIdToSymbol[hexChainId];
  console.log(
    `[API] chainId=${chainId}, hexChainId=${hexChainId}, symbol=${symbol}`
  );

  if (!symbol) {
    console.error(`[API] No symbol mapping for chain ID: ${chainId}`);
    return NextResponse.json(
      { error: `No symbol mapping for chain ID: ${chainId}` },
      { status: 400 }
    );
  }

  if (!CMC_API_KEY) {
    console.error("[API] Missing CoinMarketCap API key");
    return NextResponse.json(
      {
        error: "Missing CoinMarketCap API key",
        code: "ERR_MISSING_API_KEY",
        hint: "Set CMC_API_KEY in your environment variables (.env.local)",
      },
      { status: 500 }
    );
  }

  try {
    console.log(`[API] Fetching rate for ${symbol} in ${fiat}`);
    const res = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=${fiat}`,
      { headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY } }
    );
    const data = await res.json();
    console.log("[API] Raw CMC response:", data);

    if (!res.ok) {
      throw new Error(
        data.status?.error_message || "Failed to fetch from CoinMarketCap"
      );
    }

    const rate = data.data?.[symbol]?.quote?.[fiat]?.price;
    console.log(`[API] Extracted rate for ${symbol}:`, rate);

    if (rate === undefined) {
      throw new Error(`No conversion data for symbol: ${symbol}`);
    }

    return NextResponse.json({ conversionRate: rate });
  } catch (error: unknown) {
    console.error("[API Error]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        code: "ERR_CMC_API",
      },
      { status: 500 }
    );
  }
}
