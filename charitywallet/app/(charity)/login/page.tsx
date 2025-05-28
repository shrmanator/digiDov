"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import {
  isLoggedIn,
  generatePayload,
  logout,
  charityLogin,
} from "../../actions/auth";
import { getUserEmail } from "thirdweb/wallets/in-app";

const wallets = [
  inAppWallet({
    auth: { options: ["google", "email"] },
    executionMode: {
      mode: "EIP7702",
      sponsorGas: false,
      
    },
  }),
  createWallet("io.metamask"),
  createWallet("app.phantom"),
  createWallet("com.zengo"),
];

export default function Home() {
  const router = useRouter();
  const activeAccount = useActiveAccount();
  console.log("Active Account:", activeAccount);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center mb-5">
          <Image
            src="/images/dovcoin-logo.png"
            alt="Dovcoin Logo"
            width={90}
            height={90}
            className="mr-4"
            quality={100}
          />
          <h1 className="text-5xl text-orange-600 font-tsukimi font-bold">
            digiDov
          </h1>
        </div>

        <ConnectEmbed
          client={client}
          wallets={wallets}
          header={{ title: " " }}
          showThirdwebBranding={false}
          chain={ethereum}
          auth={{
            isLoggedIn: async () => await isLoggedIn(),
            doLogin: async (params) => {
              // 1. fetch OAuth email
              const email = await getUserEmail({ client });

              // 2. grab the active on-chain wallet
              const txWallet = activeAccount?.address;

              // 3. attach both to login payload
              const enrichedParams = {
                ...params,
                context: { email, txWallet },
              };

              // 4. call server action
              await charityLogin(enrichedParams);

              // 5. navigate to dashboard
              router.push("/dashboard/overview");
            },
            getLoginPayload: async ({ address }) =>
              generatePayload({
                address: address.toLowerCase(),
                chainId: ethereum.id,
              }),
            doLogout: async () => await logout(),
          }}
        />

        <p className="text-xs text-gray-500 mt-4">
          🔒 Your data remains private and secure.
        </p>
      </div>
    </div>
  );
}
