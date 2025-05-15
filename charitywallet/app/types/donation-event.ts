/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

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
