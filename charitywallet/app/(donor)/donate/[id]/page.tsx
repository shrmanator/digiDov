"use client";

import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { isLoggedIn, login, generatePayload, logout } from "@/app/actions/auth";
import { useCharity } from "@/hooks/use-charity";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.ledger"),
  createWallet("com.mewwallet"),
  createWallet("com.binance"),
];

export default function Donate() {
  const router = useRouter();
  const { charity } = useCharity();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <ConnectEmbed
          client={client}
          welcomeScreen={{
            title: "Your gateway to decentralized giving",
            subtitle: "Connect wallet to donate to Charity Name",
          }}
          wallets={wallets}
          header={{ title: "Connect wallet", titleIcon: "/file.svg" }}
          showThirdwebBranding={false}
          chain={ethereum}
          modalSize={"wide"}
          auth={{
            isLoggedIn: async (address) => {
              console.log("Checking if logged in", { address });
              return await isLoggedIn();
            },
            doLogin: async (params) => {
              console.log("Logging in!");
              await login(params);
              router.push("/dashboard");
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
      </div>
    </div>
  );
}
