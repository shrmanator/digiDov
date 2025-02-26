"use client";

import { useActiveAccount } from "thirdweb/react";
import { signLoginPayload } from "thirdweb/auth";
import { generatePayload, verifyPayload } from "@/app/actions/auth";
import { ethereum } from "thirdweb/chains";

export function useLogin() {
  const account = useActiveAccount();

  const login = async () => {
    if (!account) {
      alert("Please connect your wallet");
      return;
    }

    // Step 1: Generate the payload
    const payload = await generatePayload({
      address: account.address,
      chainId: ethereum.id,
    });

    // Step 2: Sign the payload
    const signatureResult = await signLoginPayload({ account, payload });

    // Step 3: Verify the payload on the server
    const finalResult = await verifyPayload(signatureResult);

    alert(finalResult.valid ? "Login successful" : "Login failed");
  };

  return { login, account };
}
