"use client";

import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { isLoggedIn, login, generatePayload, logout } from "./actions/auth";

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
        <ConnectEmbed
          client={client}
          wallets={wallets}
          header={{ title: "Choose a login method" }}
          showThirdwebBranding={false}
          chain={polygon}
          auth={{
            isLoggedIn: async (address) => {
              console.log("Checking if logged in", { address });
              return await isLoggedIn();
            },
            doLogin: async (params) => {
              console.log("Logging in!");
              await login(params);
              // Redirect to the dashboard after successful login
              router.push("/dashboard");
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
