import Web3 from "web3";
const web3 = new Web3();

// Raw event data including the new usdcSent field
export interface RawDonationEventData {
  donor: string;
  charity: string;
  fullAmount: string;
  netAmount: string;
  fee: string;
  usdcSent: string; // newly added to capture forwarded USDC
}

// Enriched event data including extra metadata (e.g. transactionHash).
export interface EnrichedDonationEventData extends RawDonationEventData {
  transactionHash: string;
}

/**
 * Finds and extracts the DonationForwarded event from the payload,
 * then decodes its data.
 * Returns the decoded RawDonationEventData, or null if not found.
 */
export function extractDonationEventFromPayload(
  payload: any
): RawDonationEventData | null {
  if (!payload.logs || payload.logs.length === 0) {
    return null;
  }

  // Updated topic0 hash for 6-parameter DonationForwarded
  const donationForwardedTopicHash = web3.utils.sha3(
    "DonationForwarded(address,address,uint256,uint256,uint256,uint256)"
  )!;

  // Find the DonationForwarded event log using topic0
  const donationLog = payload.logs.find(
    (log: any) => log.topic0 === donationForwardedTopicHash
  );
  if (!donationLog) return null;

  return decodeDonationLog(donationLog);
}

/**
 * Decodes a DonationForwarded event log into a RawDonationEventData object.
 * Handles four non-indexed values now: fullAmount, netAmount, fee, usdcSent.
 */
export function decodeDonationLog(log: any): RawDonationEventData {
  const donor = "0x" + log.topic1.slice(-40);
  const charity = "0x" + log.topic2.slice(-40);

  const data = log.data.slice(2); // Remove "0x"
  const fullAmountHex = data.slice(0, 64);
  const netAmountHex = data.slice(64, 128);
  const feeHex = data.slice(128, 192);
  const usdcSentHex = data.slice(192, 256);

  const fullAmount = web3.utils.hexToNumberString("0x" + fullAmountHex);
  const netAmount = web3.utils.hexToNumberString("0x" + netAmountHex);
  const fee = web3.utils.hexToNumberString("0x" + feeHex);
  const usdcSent = web3.utils.hexToNumberString("0x" + usdcSentHex);

  return {
    donor,
    charity,
    fullAmount,
    netAmount,
    fee,
    usdcSent,
  };
}

/**
 * Enriches the raw donation event data with extra metadata such as the transaction hash.
 */
export function enrichDonationEvent(
  rawData: RawDonationEventData,
  transactionHash: string
): EnrichedDonationEventData {
  return {
    ...rawData,
    transactionHash,
  };
}
