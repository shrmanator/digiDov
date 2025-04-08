"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import {
  isLoggedIn,
  generatePayload,
  logout,
  charityLogin,
} from "../../actions/auth";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("app.phantom"),
  createWallet("com.ledger"),
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
        {/* <p className="mb-6 text-center text-xs">
          Easiest way to accept crypto donations
        </p> */}

        <ConnectEmbed
          client={client}
          wallets={wallets}
          header={{ title: "" }}
          showThirdwebBranding={false}
          chain={ethereum}
          auth={{
            isLoggedIn: async (address) => {
              console.log("Checking if logged in", { address });
              return await isLoggedIn();
            },
            doLogin: async (params) => {
              console.log("Logging in!");
              await charityLogin(params);
              router.push("/dashboard/overview");
            },
            getLoginPayload: async ({ address }) =>
              generatePayload({
                address: address.toLowerCase(),
                chainId: ethereum.id,
              }),
            doLogout: async () => {
              console.log("Logging out!");
              await logout();
            },
          }}
        />

        {/* <p className="text-xs text-gray-500 mt-4">
          🔒 Your data remains private and secure.
        </p> */}
      </div>
    </div>
  );
}
