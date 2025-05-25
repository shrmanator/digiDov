import Web3 from "web3";
import { DonationEvent } from "@/app/types/donation-event";

const web3 = new Web3();

/* config ---------------------------------------------------------------- */

const API = "https://insight.thirdweb.com/v1/events";
const KEY = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const HEAD: HeadersInit | undefined = KEY ? { "x-client-id": KEY } : undefined;

const SIG = web3.utils.keccak256(
  "DonationForwarded(address,address,uint256,uint256,uint256)"
);

/* public ---------------------------------------------------------------- */

/** Raw Insight response (max 50 logs) */
export async function fetchChainTransactions(
  chain: number,
  contract: string
): Promise<any[]> {
  const url = `${API}/${contract}?chain=${chain}&limit=50`;
  const res = await fetch(url, HEAD ? { headers: HEAD } : undefined);

  if (!res.ok) {
    throw new Error(
      `Insight ${res.status}: ${(await res.text()).slice(0, 120)}…`
    );
  }
  return (await res.json()).data ?? [];
}

/** Donations sent to `wallet`, decoded & sorted */
export async function fetchDonationsToWallet(
  chain: number,
  contract: string,
  wallet: string
): Promise<DonationEvent[]> {
  try {
    const logs = await fetchChainTransactions(chain, contract);

    return logs
      .filter(
        (l: any) =>
          l.topics[0] === SIG &&
          ("0x" + l.topics[2].slice(-40)).toLowerCase() === wallet.toLowerCase()
      )
      .map((l: any) => ({ ...decodeLog(l), chain }))
      .sort((a, b) => a.timestamp.raw - b.timestamp.raw);
  } catch (e) {
    console.error("fetchDonationsToWallet:", e);
    return [];
  }
}

/* helpers --------------------------------------------------------------- */

const num = (hex: string) => web3.utils.hexToNumberString(`0x${hex}`);

function decodeLog(log: any): DonationEvent {
  const [, donorHex, charityHex] = log.topics;
  const d = log.data.slice(2);

  return {
    donor: "0x" + donorHex.slice(-40),
    charity: "0x" + charityHex.slice(-40),
    fullAmount: num(d.slice(0, 64)),
    netAmount: num(d.slice(64, 128)),
    fee: num(d.slice(128, 192)),
    transactionHash: log.transaction_hash,
    timestamp: ts(log.block_timestamp),
    chain: 1, // overwritten by caller
  };
}

const ts = (sec: string) => {
  const raw = +sec * 1_000;
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
};
