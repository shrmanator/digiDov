"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethereum, polygon, Chain } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import {
  isLoggedIn,
  generatePayload,
  logout,
  donorLogin,
} from "@/app/actions/auth";
import { VerifyLoginPayloadParams } from "thirdweb/auth";

const wallets = [
  // inAppWallet({ auth: { options: ["google", "email"] } }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.ledger"),
  createWallet("com.mewwallet"),
  createWallet("com.binance"),
];

interface ConnectWalletButtonProps {
  setIsAuthenticated: (val: boolean) => void;
  activeChain: Chain; // Added activeChain prop
}

export default function DonorConnectWalletButton({
  setIsAuthenticated,
  activeChain,
}: ConnectWalletButtonProps) {
  return (
    <ConnectButton
      chains={[ethereum, polygon]}
      client={client}
      connectModal={{
        // size: "wide",
        showThirdwebBranding: false,
      }}
      wallets={wallets}
      chain={activeChain}
      auth={{
        isLoggedIn: async (address: string) => {
          console.log("Checking if logged in", { address });
          return await isLoggedIn();
        },
        doLogin: async (params: VerifyLoginPayloadParams) => {
          console.log("Logging in!");
          await donorLogin(params);
        },
        getLoginPayload: async ({ address }: { address: string }) =>
          generatePayload({
            address: address.toLowerCase(),
            chainId: activeChain.id,
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
