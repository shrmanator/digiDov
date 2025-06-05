"use server";

import prisma from "@/lib/prisma";
import { getCurrentWallet } from "../wallet-session";

export async function markCharityKycAction() {
  // 1) Verify JWT and get the caller’s wallet address
  const authAddress = await getCurrentWallet();

  // 2) Flip the kycCompleted flag for that wallet
  const updated = await prisma.charity.update({
    where: { wallet_address: authAddress },
    data: {
      kycCompleted: true,
      kycCompletedAt: new Date(),
    },
  });

  return updated;
}
