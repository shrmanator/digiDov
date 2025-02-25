"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethereum, polygon, Chain } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { generatePayload } from "@/app/actions/auth";
import { useAuth } from "@/contexts/auth-context";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.ledger"),
  createWallet("com.mewwallet"),
  createWallet("com.binance"),
];

interface ConnectWalletButtonProps {
  activeChain: Chain;
}

export default function ConnectWalletButton({
  activeChain,
}: ConnectWalletButtonProps) {
  const { login, logout, user } = useAuth(); // Use global context

  return (
    <ConnectButton
      chains={[ethereum, polygon]}
      client={client}
      connectModal={{
        showThirdwebBranding: false,
      }}
      wallets={wallets}
      chain={activeChain}
      auth={{
        isLoggedIn: async (address: string) => {
          console.log("Checking if logged in", { address });
          // Check if the user is logged in via context
          return !!user;
        },
        doLogin: async (params: VerifyLoginPayloadParams) => {
          console.log("Logging in!");
          await login(params); // Use the context's login function
        },
        getLoginPayload: async ({ address }: { address: string }) =>
          generatePayload({
            address: address.toLowerCase(),
            chainId: activeChain.id,
          }),
        doLogout: async () => {
          console.log("Logging out!");
          await logout(); // Use the context's logout function
        },
      }}
    />
  );
}
