"use client";

import { useActiveAccount } from "thirdweb/react";
import { signLoginPayload } from "thirdweb/auth";
import { generatePayload, verifyPayload } from "@/app/actions/auth";

export const LoginButton: React.FC = () => {
  const account = useActiveAccount();
  async function handleClick() {
    if (!account) {
      return alert("Please connect your wallet");
    }
    // Step 1: Generate the payload
    const payload = await generatePayload({
      address: account.address,
      chainId: 17000,
    });
    // Step 2: Sign the payload
    const signatureResult = await signLoginPayload({ account, payload });
    // Step 3: Send the signature to the server for verification
    const finalResult = await verifyPayload(signatureResult);

    alert(finalResult.valid ? "Login successful" : "Login failed");
  }

  return (
    <button disabled={!account} onClick={handleClick}>
      Login
    </button>
  );
};
