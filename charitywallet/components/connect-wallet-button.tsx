"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { isLoggedIn, login, generatePayload, logout } from "@/app/actions/auth";
import { VerifyLoginPayloadParams } from "thirdweb/auth";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.ledger"),
  createWallet("com.mewwallet"),
  createWallet("com.binance"),
];

interface ConnectWalletButtonProps {
  setIsAuthenticated: (val: boolean) => void;
}

export default function ConnectWalletButton({
  setIsAuthenticated,
}: ConnectWalletButtonProps) {
  return (
    <ConnectButton
      client={client}
      connectModal={{
        size: "wide",
        showThirdwebBranding: false,
      }}
      wallets={wallets}
      chain={ethereum}
      auth={{
        isLoggedIn: async (address: string) => {
          console.log("Checking if logged in", { address });
          return await isLoggedIn();
        },
        doLogin: async (params: VerifyLoginPayloadParams) => {
          console.log("Logging in!");
          await login(params);
        },
        getLoginPayload: async ({ address }: { address: string }) =>
          generatePayload({
            address: address.toLowerCase(),
            chainId: ethereum.id,
          }),
        doLogout: async () => {
          console.log("Logging out!");
          await logout();
          setIsAuthenticated(false);
        },
      }}
    />
  );
}
