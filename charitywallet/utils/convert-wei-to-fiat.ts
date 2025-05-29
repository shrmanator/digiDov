import Web3 from "web3";

const web3 = new Web3();

function formatDateForCoinGecko(timestampSec: number): string {
  const d = new Date(timestampSec * 1000);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export async function convertWeiToFiat(
  weiAmount: string,
  timestampSec: number,
  currency: string
): Promise<number> {
  if (!weiAmount) throw new Error("weiAmount is required");
  if (!timestampSec) throw new Error("timestamp is required");

  const ethAmt = parseFloat(web3.utils.fromWei(weiAmount, "ether"));
  const dateStr = formatDateForCoinGecko(timestampSec);
  const tokenId = "ethereum";
  const curr = currency.toLowerCase();

  // 1) Try historical price
  try {
    const hist = await fetch(
      `https://api.coingecko.com/api/v3/coins/${tokenId}/history?date=${dateStr}&localization=false`,
      { next: { revalidate: 3600 } }
    );
    if (!hist.ok) throw new Error(`History API ${hist.status}`);
    const json = await hist.json();
    const p = json?.market_data?.current_price?.[curr];
    if (p != null) return ethAmt * p;
    throw new Error("no historical price");
  } catch (e) {
    console.warn(`History lookup failed for ${dateStr}, falling back`, e);
  }

  // 2) Fallback to current spot price
  const spotRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${curr}`,
    { next: { revalidate: 300 } }
  );
  if (!spotRes.ok) throw new Error(`Simple-price API ${spotRes.status}`);
  const spotJson = await spotRes.json();
  const spot = spotJson?.[tokenId]?.[curr];
  if (spot == null) throw new Error(`No current price in ${currency}`);
  return ethAmt * spot;
}
