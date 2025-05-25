// app/(charity)/dashboard/overview/donations/donations-stream.tsx
import TransactionHistory from "@/components/transaction-history-via-blockchain";
import type { DonationReceipt } from "@/app/types/receipt";

import { fetchAllChainDonations } from "./donations.service";

/* ------------------------------------------------------------------ */
/*  Async Server Component                                             */
/* ------------------------------------------------------------------ */

/**
 * Streams the donation table once the third‑party fetch completes.
 * Because this is a React *server* component, it has **zero** client JS
 * cost.  Wrap it in `<Suspense>` from the parent page for instant first
 * paint without blocking on the slow Insight API.
 */
export default async function DonationsStream(props: {
  wallet: string;
  receipts: DonationReceipt[];
  donationLink: string;
}) {
  const donations = await fetchAllChainDonations(props.wallet);

  return (
    <TransactionHistory
      donations={donations}
      receipts={props.receipts}
      donationLink={props.donationLink}
    />
  );
}
