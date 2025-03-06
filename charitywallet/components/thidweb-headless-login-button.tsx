"use client";

import { useActiveAccount } from "thirdweb/react";
import { signLoginPayload } from "thirdweb/auth";
import { generatePayload, verifyPayload } from "@/app/actions/auth";
import { useConnectModal } from "thirdweb/react"; // Import Thirdweb's connect modal
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";

export function useLogin() {
  const account = useActiveAccount();
  const { connect } = useConnectModal(); // Thirdweb's connect modal

  const login = async () => {
    if (!account) {
      connect({ client }); // Open the wallet connection modal
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
