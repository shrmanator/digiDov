import { useEffect, useState } from "react";
import { useIncompleteDonorProfile } from "@/hooks/use-incomplete-donor-profile";

export function useDonorProfileModal(walletAddress: string | undefined) {
  const { isIncomplete, isLoading } = useIncompleteDonorProfile(
    walletAddress ?? ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Open the modal if the donor is incomplete and not loading
    if (isIncomplete && !isLoading && !isModalOpen) {
      setIsModalOpen(true);
    }
  }, [isIncomplete, isLoading, isModalOpen]);

  return { isModalOpen, setIsModalOpen };
}
