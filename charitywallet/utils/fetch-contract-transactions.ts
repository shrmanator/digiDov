import { DonationEvent } from "@/app/types/donation-event";
import Web3 from "web3";

const web3 = new Web3();

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const DONATION_FORWARDED_TOPIC_HASH = web3.utils.keccak256(
  "DonationForwarded(address,address,uint256,uint256,uint256)"
);

const API_BASE = "https://insight.thirdweb.com/v1/events";
const API_KEY = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const toHexNum = (hex: string) => web3.utils.hexToNumberString(`0x${hex}`);

/* ------------------------------------------------------------------ */
/*  Public functions                                                  */
/* ------------------------------------------------------------------ */

export async function fetchChainTransactions(
  chain: number,
  contractAddress: string
): Promise<any[]> {
  const url = `${API_BASE}/${contractAddress}?chain=${chain}&limit=50`;
  const headers: HeadersInit = API_KEY ? { "x-client-id": API_KEY } : {};

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Insight API ${res.status} ${res.statusText}: ${body.slice(0, 120)}…`
    );
  }

  const { data } = await res.json();
  return data ?? [];
}

export async function fetchDonationsToWallet(
  chain: number,
  contractAddress: string,
  walletAddress: string
): Promise<DonationEvent[]> {
  try {
    const events = await fetchChainTransactions(chain, contractAddress);

    return events
      .filter(
        (log: any) =>
          log.topics[0] === DONATION_FORWARDED_TOPIC_HASH &&
          ("0x" + log.topics[2].slice(-40)).toLowerCase() ===
            walletAddress.toLowerCase()
      )
      .map((log: any) => ({ ...decodeDonationLog(log), chain }))
      .sort((a, b) => a.timestamp.raw - b.timestamp.raw);
  } catch (err) {
    console.error("Error fetching donation events:", err);
    return [];
  }
}

function decodeDonationLog(log: any): DonationEvent {
  const donor = "0x" + log.topics[1].slice(-40);
  const charity = "0x" + log.topics[2].slice(-40);
  const data = log.data.slice(2);

  return {
    donor,
    charity,
    fullAmount: toHexNum(data.slice(0, 64)),
    netAmount: toHexNum(data.slice(64, 128)),
    fee: toHexNum(data.slice(128, 192)),
    transactionHash: log.transaction_hash,
    timestamp: formatTimestamp(log.block_timestamp),
    chain: 1, // overwritten by fetchDonationsToWallet
  };
}

function formatTimestamp(timestampSec: string): {
  formatted: string;
  raw: number;
} {
  const raw = Number(timestampSec) * 1_000;
  return {
    raw,
    formatted: new Date(raw).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}
