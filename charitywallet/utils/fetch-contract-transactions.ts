import Web3 from "web3";

const web3 = new Web3();

/** topic-0 hash for DonationForwarded(address,address,uint256,uint256,uint256) */
export const DONATION_FORWARDED_TOPIC_HASH = web3.utils.keccak256(
  "DonationForwarded(address,address,uint256,uint256,uint256)"
);

export interface DonationEvent {
  donor: string;
  charity: string;
  fullAmount: string;
  netAmount: string;
  fee: string;
  transactionHash: string;
  timestamp: { formatted: string; raw: number };
  chain: number;
}

/* ------------------------------------------------------------------ */
/*  Low-level: fetch ONE paginated slice from Insight                 */
/* ------------------------------------------------------------------ */
interface InsightPage {
  data?: any[]; // might be missing
  meta: { total_pages?: number };
}

export async function fetchChainTransactionsPage(
  chain: number,
  contractAddress: string,
  page: number = 0,
  limit: number = 25,
  topic2?: string
): Promise<InsightPage> {
  const base = `https://insight.thirdweb.com/v1/events/${contractAddress}`;
  const params =
    `?chain=${chain}` +
    `&limit=${limit}` +
    `&page=${page}` +
    (topic2 ? `&filter_topic_2=${topic2.toLowerCase()}` : "") +
    `&clientId=${process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!}`;

  const res = await fetch(base + params, {
    headers: { "x-client-id": process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Insight ${res.status} ${res.statusText}: ${await res.text()}`
    );
  }

  // always return a defined data array
  const json = (await res.json()) as InsightPage;
  return {
    data: Array.isArray(json.data) ? json.data : [],
    meta: json.meta,
  };
}

/* ------------------------------------------------------------------ */
/*  Decode helpers                                                    */
/* ------------------------------------------------------------------ */
function decodeDonationLog(log: any) {
  const donor = "0x" + log.topics[1].slice(-40);
  const charity = "0x" + log.topics[2].slice(-40);
  const d = log.data.slice(2);
  const fullAmount = web3.utils.hexToNumberString("0x" + d.slice(0, 64));
  const netAmount = web3.utils.hexToNumberString("0x" + d.slice(64, 128));
  const fee = web3.utils.hexToNumberString("0x" + d.slice(128, 192));

  return {
    donor,
    charity,
    fullAmount,
    netAmount,
    fee,
    transactionHash: log.transaction_hash,
    timestamp: formatTimestamp(log.block_timestamp),
  };
}

/**
 * Safely maps a page of raw logs into DonationEvent[]
 * (ignores undefined / non-array inputs).
 */
function mapLogsToDonations(
  logs: any[] | undefined,
  wallet: string,
  chain: number
): DonationEvent[] {
  if (!Array.isArray(logs)) return [];
  return logs
    .filter(
      (log) =>
        log.topics[0] === DONATION_FORWARDED_TOPIC_HASH &&
        ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.toLowerCase()
    )
    .map((log) => ({ ...decodeDonationLog(log), chain }))
    .sort((a, b) => a.timestamp.raw - b.timestamp.raw);
}

/* ------------------------------------------------------------------ */
/*  High-level: fetch ALL pages (server or API route)                 */
/* ------------------------------------------------------------------ */
export async function fetchDonationsToWallet(
  chain: number,
  contractAddress: string,
  walletAddress: string,
  pageSize: number = 25
): Promise<DonationEvent[]> {
  const all: DonationEvent[] = [];
  let page = 0;
  let totalPages = Infinity;

  while (page < totalPages) {
    const { data, meta } = await fetchChainTransactionsPage(
      chain,
      contractAddress,
      page,
      pageSize,
      walletAddress // server-side filter by topic2
    );

    all.push(...mapLogsToDonations(data, walletAddress, chain));
    totalPages = meta.total_pages ?? page + 1;
    page += 1;
  }

  return all;
}

/* ------------------------------------------------------------------ */
export const formatTimestamp = (
  tsSec: string
): { formatted: string; raw: number } => {
  const raw = Number(tsSec) * 1000;
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
