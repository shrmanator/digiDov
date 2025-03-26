"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
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
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center mb-4">
          <Image
            src="/images/dovcoin-logo.png"
            alt="Dovcoin Logo"
            width={50}
            height={50}
            className="mr-4"
          />
          <h1 className="text-4xl text-orange-700 font-offside">digiDov</h1>
        </div>
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
