import { getDonorByWallet } from "@/app/actions/donors";
import { useEffect, useState } from "react";

export function useIncompleteDonorProfile(walletAddress: string) {
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      if (!walletAddress) return;

      try {
        const donor = await getDonorByWallet(walletAddress);
        if (donor && !donor.is_profile_complete) {
          setIsIncomplete(true);
        } else {
          setIsIncomplete(false);
        }
      } catch (error) {
        console.error("Error fetching donor profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkProfile();
  }, [walletAddress]);

  return { isIncomplete, isLoading };
}
