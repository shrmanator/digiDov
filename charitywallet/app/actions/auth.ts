"use server";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth"; // Import the singleton
import { upsertCharity } from "./charities";

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  console.log("payload", verifiedPayload);
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    (await cookies()).set("jwt", jwt);

    // Normalize wallet address and upsert charity record
    const walletAddress = verifiedPayload.payload.address.toLowerCase();
    console.log("wallet addr", walletAddress);
    await upsertCharity({
      legal_name: "Default Legal Name",
      registered_address: "Default Registered Address",
      registration_number: "Default Registration Number",
      contact_name: "Default Contact Name",
      contact_email: "Default Contact Email",
      contact_phone: "Default Contact Phone",
      wallet_address: walletAddress,
    });
  }
}

export async function isLoggedIn() {
  const jwt = (await cookies()).get("jwt");
  console.log(jwt);
  if (!jwt?.value) {
    return false;
  }
  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  return authResult.valid;
}

export async function logout() {
  (await cookies()).delete("jwt");
}
