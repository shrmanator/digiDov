"use client";

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
        <h1 className="text-4xl font-bold mb-4">Digidov</h1>
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
