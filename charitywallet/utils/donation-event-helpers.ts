import Web3 from "web3";
const web3 = new Web3();

// Raw event data as emitted by the contract.
export interface RawDonationEventData {
  donor: string;
  charity: string;
  fullAmount: string;
  netAmount: string;
  fee: string;
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
  // Check if logs exist.
  if (!payload.logs || payload.logs.length === 0) {
    return null;
  }

  // Hardcoded topic0 hash for DonationForwarded:
  const donationForwardedTopicHash =
    "0x51297710db35bfe3f03247b2601c68b45cdab2ca01be3f3be727346c408f0f25";

  // Find the DonationForwarded event log.
  const donationLog = payload.logs.find(
    (log: any) => log.topic0 === donationForwardedTopicHash
  );

  return donationLog ? decodeDonationLog(donationLog) : null;
}

/**
 * Decodes a DonationForwarded event log into a RawDonationEventData object.
 *
 * The event is defined as:
 * event DonationForwarded(address indexed donor, address indexed charity, uint256 fullAmount, uint256 netAmount, uint256 fee)
 */
export function decodeDonationLog(log: any): RawDonationEventData {
  // The donor and charity addresses are indexed and stored in topics[1] and topics[2].
  const donor = "0x" + log.topic1.slice(-40);
  const charity = "0x" + log.topic2.slice(-40);

  // The data field contains three 32-byte (64 hex characters) values: fullAmount, netAmount, fee.
  const data = log.data.slice(2); // Remove "0x"
  const fullAmountHex = data.slice(0, 64);
  const netAmountHex = data.slice(64, 128);
  const feeHex = data.slice(128, 192);

  const fullAmount = web3.utils.hexToNumberString("0x" + fullAmountHex);
  const netAmount = web3.utils.hexToNumberString("0x" + netAmountHex);
  const fee = web3.utils.hexToNumberString("0x" + feeHex);

  return {
    donor,
    charity,
    fullAmount,
    netAmount,
    fee,
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
