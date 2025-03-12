"use client";

import { useRouter } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethereum, Chain } from "thirdweb/chains"; // Removed polygon
import { client } from "@/lib/thirdwebClient";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { useAuth } from "@/contexts/auth-context";
import { generatePayload } from "@/app/actions/auth";

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

export default function DonorConnectWalletButton({
  activeChain,
}: ConnectWalletButtonProps) {
  const router = useRouter();
  const activeAccount = useActiveAccount();
  const { user, loginDonor, logout } = useAuth();

  return (
    <ConnectButton
      chains={[ethereum]} // Only Ethereum network supported now
      client={client}
      connectModal={{
        showThirdwebBranding: false,
      }}
      wallets={wallets}
      chain={activeChain}
      auth={{
        // Check both activeAccount and our context's user to support auto connect.
        isLoggedIn: async (address: string) => {
          const normalized = address.toLowerCase();
          if (activeAccount?.address.toLowerCase() === normalized) {
            return true;
          }
          return user?.walletAddress === normalized;
        },
        doLogin: async (params: VerifyLoginPayloadParams) => {
          console.log("Logging in!");
          await loginDonor(params);
          router.refresh();
        },
        getLoginPayload: async ({ address }: { address: string }) =>
          generatePayload({
            address: address.toLowerCase(),
            chainId: ethereum.id, // Directly set to Ethereum chain id
          }),
        doLogout: async () => {
          console.log("Logging out!");
          await logout();
          router.refresh();
        },
      }}
    />
  );
}
