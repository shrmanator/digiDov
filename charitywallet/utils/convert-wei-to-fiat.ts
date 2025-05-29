import web3 from "web3";

export async function convertWeiToFiat(
  weiAmount: string,
  tsSeconds: number,
  currency: string
): Promise<number> {
  if (!weiAmount) throw new Error("weiAmount is required");
  if (tsSeconds == null) throw new Error("timestamp is required");

  const ethAmt = parseFloat(web3.utils.fromWei(weiAmount, "ether"));
  const tokenId = "ethereum";
  const curr = currency.toLowerCase();

  // Try the precise range endpoint around the tx moment
  try {
    const from = tsSeconds - 300; // 5 minutes before
    const to = tsSeconds + 300; // 5 minutes after
    const url = new URL(
      `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart/range`
    );
    url.searchParams.set("vs_currency", curr);
    url.searchParams.set("from", String(from));
    url.searchParams.set("to", String(to));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      // 'prices' is an array of [ timestamp_ms, price ]
      const prices: [number, number][] = json.prices;
      if (prices?.length) {
        // find the point closest to our tx time
        const targetMs = tsSeconds * 1_000;
        let best = prices[0];
        for (const p of prices) {
          if (Math.abs(p[0] - targetMs) < Math.abs(best[0] - targetMs)) {
            best = p;
          }
        }
        return ethAmt * best[1];
      }
    } else {
      console.warn(`Range API returned ${res.status}`);
    }
  } catch (err) {
    console.warn("Range lookup failed, falling back to spot", err);
  }

  // Fallback to simple spot price
  const spotRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${curr}`,
    { next: { revalidate: 300 } }
  );
  if (!spotRes.ok) {
    throw new Error(`Simple-price API ${spotRes.status}`);
  }
  const spotJson = await spotRes.json();
  const spot = spotJson[tokenId]?.[curr];
  if (typeof spot !== "number") {
    throw new Error(`No current price for ${currency}`);
  }
  return ethAmt * spot;
}
