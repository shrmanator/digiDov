"use server";

import type { VerifyLoginPayloadParams } from "thirdweb/auth";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";
import { upsertCharity } from "./charities";
import { upsertDonor } from "./donors";

export const generatePayload = thirdwebAuth.generatePayload;
export const verifyPayload = thirdwebAuth.verifyPayload;

export async function charityLogin(
  params: VerifyLoginPayloadParams & { context?: { email?: string } }
) {
  // 1. Verify the SIWE payload
  const verified = await thirdwebAuth.verifyPayload(params);
  console.log("charityLogin verified payload:", verified);
  if (!verified.valid) {
    throw new Error("Invalid login payload");
  }

  // 2. Generate and set JWT cookie
  const jwt = await thirdwebAuth.generateJWT({ payload: verified.payload });
  (await cookies()).set("jwt", jwt);
  console.log("JWT set for wallet:", verified.payload.address);

  // 3. Read email from client-passed context
  const email = params.context?.email;
  console.log("charityLogin received email:", email);

  // 4. Upsert charity with contact_email if provided
  const walletAddress = verified.payload.address.toLowerCase();
  console.log("charityLogin upserting walletAddress:", walletAddress);
  await upsertCharity({
    wallet_address: walletAddress,
    ...(email ? { contact_email: email } : {}),
  });
  console.log("charity record upserted for:", walletAddress);
}

export async function donorLogin(
  params: VerifyLoginPayloadParams & { context?: { email?: string } }
) {
  // 1. Verify the SIWE payload
  const verified = await thirdwebAuth.verifyPayload(params);
  console.log("donorLogin verified payload:", verified);
  if (!verified.valid) {
    throw new Error("Invalid login payload");
  }

  // 2. Generate and set JWT cookie
  const jwt = await thirdwebAuth.generateJWT({ payload: verified.payload });
  (await cookies()).set("jwt", jwt);
  console.log("JWT set for wallet:", verified.payload.address);

  // 3. Normalize wallet address and log
  const walletAddress = verified.payload.address.toLowerCase();
  console.log("donorLogin wallet addr:", walletAddress);

  // 4. Upsert donor record
  await upsertDonor({ walletAddress });
  console.log("donor record upserted for:", walletAddress);

  // 5. Optional: Moralis integration log
  try {
    // await addWalletAddressToMoralis(walletAddress);
    console.log(
      `Wallet address ${walletAddress} added to Moralis successfully.`
    );
  } catch (error) {
    console.error(
      `Failed to add wallet address ${walletAddress} to Moralis:`,
      error
    );
  }
}

export async function isLoggedIn() {
  const jwt = (await cookies()).get("jwt");
  console.log("isLoggedIn jwt cookie:", jwt);
  if (!jwt?.value) {
    return false;
  }
  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  console.log("isLoggedIn verified:", authResult);
  return authResult.valid;
}

export async function logout() {
  console.log("logout triggered, clearing JWT cookie");
  (await cookies()).delete("jwt");
}
