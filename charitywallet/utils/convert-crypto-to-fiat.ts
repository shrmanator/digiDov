export async function fetchPrices(coinIds: string, currency = "usd") {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=${currency}`,
    { next: { revalidate: 60 } } // optional: revalidate every 60 seconds
  );
  if (!res.ok) {
    throw new Error("Failed to fetch prices");
  }
  return res.json();
}
