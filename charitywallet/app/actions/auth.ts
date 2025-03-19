"use server";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";
import { upsertCharity } from "./charities";
// import { addWalletAddressToMoralis } from "./moralis";
import { upsertDonor } from "./donors";

export const generatePayload = thirdwebAuth.generatePayload;
export const verifyPayload = thirdwebAuth.verifyPayload;

export async function charityLogin(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  console.log("payload", verifiedPayload);

  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    (await cookies()).set("jwt", jwt);

    // Normalize wallet address and create a minimal charity record.
    const walletAddress = verifiedPayload.payload.address.toLowerCase();
    console.log("wallet addr", walletAddress);
    await upsertCharity({
      wallet_address: walletAddress,
    });
  }
}

export async function donorLogin(payload: VerifyLoginPayloadParams) {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  console.log("payload", verifiedPayload);

  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    (await cookies()).set("jwt", jwt);

    // Normalize wallet address and create a minimal donor record.
    const walletAddress = verifiedPayload.payload.address.toLowerCase();
    console.log("wallet addr", walletAddress);
    await upsertDonor({
      walletAddress,
    });

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
