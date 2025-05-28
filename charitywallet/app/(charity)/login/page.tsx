"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethereum, sepolia } from "thirdweb/chains";
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
    smartAccount: {
      chain: ethereum,
      sponsorGas: false, // or true if you want to sponsor gas
    },
  }),
  createWallet("io.metamask"),
  createWallet("app.phantom"),
  createWallet("com.zengo"),
];

export default function Home() {
  const router = useRouter();

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
          // accountAbstraction={{ chain: ethereum, sponsorGas: false }}
          auth={{
            isLoggedIn: async () => await isLoggedIn(),
            doLogin: async (params) => {
              // 1. fetch OAuth email from in-app wallet session
              const email = await getUserEmail({ client });

              // 2. attach email to login params
              const enrichedParams = { ...params, context: { email } };

              // 3. call server action with enriched payload
              await charityLogin(enrichedParams);

              // 4. navigate to dashboard
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
