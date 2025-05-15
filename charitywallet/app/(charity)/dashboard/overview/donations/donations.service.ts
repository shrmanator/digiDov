import { ethereum, polygon } from "thirdweb/chains";
import { fetchDonationsToWallet } from "@/utils/fetch-contract-transactions";
import { DonationEvent } from "@/app/types/donation-event";

/* ------------------------------------------------------------------ */
/*  Contract addresses per chain                                       */
/* ------------------------------------------------------------------ */

const CONTRACT_ADDRESSES: Record<number, string> = {
  [ethereum.id]: process.env.ETH_MAINNET_TRANSACTION_WITH_FEE_CONTRACT_ADDRESS!,
  [polygon.id]: process.env.POL_MAINNET_TRANSACTION_WITH_FEE_CONTRACT_ADDRESS!,
};

/* ------------------------------------------------------------------ */
/*  Public helper                                                      */
/* ------------------------------------------------------------------ */

/**
 * Fetches donations across all supported chains for a given charity wallet.
 * Returns them sorted oldest → newest.
 */
export async function fetchAllChainDonations(
  walletAddress: string
): Promise<DonationEvent[]> {
  const [ethDonations, polyDonations] = await Promise.all([
    fetchDonationsToWallet(
      ethereum.id,
      CONTRACT_ADDRESSES[ethereum.id],
      walletAddress
    ),
    fetchDonationsToWallet(
      polygon.id,
      CONTRACT_ADDRESSES[polygon.id],
      walletAddress
    ),
  ]);

  const combined = [...ethDonations, ...polyDonations];
  combined.sort((a, b) => a.timestamp.raw - b.timestamp.raw);
  return combined;
}
