import useSWR from "swr";
import { getDonorByWallet } from "@/app/actions/donors";

export function useIncompleteDonorProfile(walletAddress: string | undefined) {
  const {
    data: donor,
    error,
    mutate,
  } = useSWR(walletAddress ? `donor-${walletAddress}` : null, () =>
    walletAddress ? getDonorByWallet(walletAddress) : null
  );

  const isLoading = !donor && !error;
  const isIncomplete = donor ? !donor.is_profile_complete : false;

  return { donor, isIncomplete, isLoading, mutate };
}
