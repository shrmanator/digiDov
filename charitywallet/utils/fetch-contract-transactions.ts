import Web3 from "web3";

const web3 = new Web3();

// Hardcoded topic0 hash for DonationForwarded event remains unchanged
const DONATION_FORWARDED_TOPIC_HASH = web3.utils.keccak256(
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

export const fetchChainTransactions = async (
  chain: number,
  contractAddress: string
): Promise<any[]> => {
  const url = `https://insight.thirdweb.com/v1/events/${contractAddress}?chain=${chain}&limit=50`;

  const response = await fetch(url, {
    headers: {
      "x-client-id": "d98b838c8c5cd1775c46b05d7385b215",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error fetching transactions on chain ${chain}: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const json = await response.json();
  return json.data;
};

export const fetchDonationsToWallet = async (
  chain: number,
  contractAddress: string,
  walletAddress: string
): Promise<DonationEvent[]> => {
  try {
    const events = await fetchChainTransactions(chain, contractAddress);

    const donations: DonationEvent[] = events
      .filter(
        (log: any) =>
          log.topics[0] === DONATION_FORWARDED_TOPIC_HASH &&
          ("0x" + log.topics[2].slice(-40)).toLowerCase() ===
            walletAddress.toLowerCase()
      )
      .map((log: any) => {
        const donation = decodeDonationLog(log);
        return { ...donation, chain }; // attach the chain info
      });

    donations.sort((a, b) => a.timestamp.raw - b.timestamp.raw);

    return donations;
  } catch (error) {
    console.error("Error fetching donation events:", error);
    return [];
  }
};

export const decodeDonationLog = (log: any): DonationEvent => {
  const donor = "0x" + log.topics[1].slice(-40);
  const charity = "0x" + log.topics[2].slice(-40);
  const data = log.data.slice(2);
  const fullAmount = web3.utils.hexToNumberString("0x" + data.slice(0, 64));
  const netAmount = web3.utils.hexToNumberString("0x" + data.slice(64, 128));
  const fee = web3.utils.hexToNumberString("0x" + data.slice(128, 192));

  return {
    donor,
    charity,
    fullAmount,
    netAmount,
    fee,
    transactionHash: log.transaction_hash,
    timestamp: formatTimestamp(log.block_timestamp),
    chain: 1, // default value; will be overwritten in fetchDonationsToWallet
  };
};

export const formatTimestamp = (
  timestampSec: string
): { formatted: string; raw: number } => {
  const rawTimestamp = Number(timestampSec) * 1000;
  const formatted = new Date(rawTimestamp).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { formatted, raw: rawTimestamp };
};
