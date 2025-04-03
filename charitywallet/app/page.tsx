"use client";

import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import Image from "next/image";

import {
  isLoggedIn,
  generatePayload,
  logout,
  charityLogin,
} from "./actions/auth";

// Configure the wallet(s) you want to support—in this case, an in-app wallet with Google and email auth
const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
    },
  }),
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

          <h1 className="text-5xl text-orange-600 font-tsukimi">digiDov</h1>
        </div>
        {/* <p className="mb-6 text-center text-xs">Crypto, Tax Receipts, Audit Trail</p> */}

        <ConnectEmbed
          client={client}
          wallets={wallets}
          header={{ title: "" }}
          showThirdwebBranding={false}
          chain={polygon}
          auth={{
            isLoggedIn: async (address) => {
              console.log("Checking if logged in", { address });
              return await isLoggedIn();
            },
            doLogin: async (params) => {
              console.log("Logging in!");
              await charityLogin(params);
              // Redirect to the dashboard after successful login
              router.push("/dashboard/overview");
            },
            getLoginPayload: async ({ address }) =>
              generatePayload({
                address: address.toLowerCase(),
                chainId: polygon.id,
              }),
            doLogout: async () => {
              console.log("Logging out!");
              await logout();
            },
          }}
        />
      </div>
    </div>
  );
}
