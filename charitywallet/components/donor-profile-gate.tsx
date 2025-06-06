"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useIncompleteDonorProfile } from "@/hooks/use-incomplete-donor-profile";
import DonorProfileModal from "@/components/new-donor-modal/new-donor-modal";

/**
 * Gate component that shows the donor profile modal when a logged in donor
 * has not completed their profile yet.
 */
export default function DonorProfileGate() {
  const { user, donor } = useAuth();
  const { isIncomplete } = useIncompleteDonorProfile(donor?.wallet_address);

  const [open, setOpen] = useState(false);

  // Open the modal whenever we detect an incomplete profile.
  useEffect(() => {
    if (user && donor && isIncomplete) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, donor, isIncomplete]);

  if (!user || (user.role && user.role !== "donor") || !donor || !isIncomplete) {
    return null;
  }

  return (
    <DonorProfileModal
      walletAddress={donor.wallet_address}
      open={open}
      onClose={() => setOpen(false)}
    />
  );
}

