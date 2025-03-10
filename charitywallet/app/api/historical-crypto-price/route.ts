import type { NextApiRequest, NextApiResponse } from "next";

const coinIdMapping: { [symbol: string]: string } = {
  ETH: "ethereum",
  POL: "matic-network", // Adjust as needed.
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tokenSymbol, date = "usd" } = req.query;

  if (!tokenSymbol || !date) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const coinId = coinIdMapping[tokenSymbol as string];
  if (!coinId) {
    return res.status(400).json({ error: "Invalid token symbol." });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${date}`
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Error fetching data from CoinGecko." });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error.", details: String(error) });
  }
}
