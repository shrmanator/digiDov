"use server";

import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";
import prisma from "@/lib/prisma";

export async function markCharityKycAction(wallet_address: string) {
  // 1) Read the “jwt” cookie
  const jwtCookie = (await cookies()).get("jwt")?.value;
  if (!jwtCookie) {
    throw new Error("Not authenticated");
  }

  // 2) Verify the JWT; note: verifyJWT returns { valid, parsedJWT } when valid, or { valid: false, error } when not.
  const result = await thirdwebAuth.verifyJWT({ jwt: jwtCookie });
  if (!result.valid) {
    throw new Error("Invalid or expired login session");
  }

  // 3) Extract the address from parsedJWT
  const parsed = result.parsedJWT as { address?: string; [key: string]: any };
  if (!parsed.address) {
    throw new Error("JWT missing ‘address’ claim");
  }

  // 4) Normalize & compare
  const authAddress = parsed.address.toLowerCase();
  const targetAddress = wallet_address.toLowerCase();
  if (authAddress !== targetAddress) {
    throw new Error("Unauthorized: wallet mismatch");
  }

  // 5) Flip the flag in the database
  const updated = await prisma.charity.update({
    where: { wallet_address: authAddress },
    data: {
      kycCompleted: true,
      kycCompletedAt: new Date(),
    },
  });

  return updated;
}
