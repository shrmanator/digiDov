"use client";

import { useRouter } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { ethereum, polygon, Chain } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { useAuth } from "@/contexts/auth-context";
import { generatePayload } from "@/app/actions/auth";

const wallets = [
  createWallet("io.metamask"),
  createWallet("app.phantom"),
  createWallet("com.zengo"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.ledger"),
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
      chains={[ethereum, polygon]}
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
          // If thirdweb has an active account matching the address, consider it logged in.
          if (activeAccount?.address.toLowerCase() === normalized) {
            return true;
          }
          // Otherwise, fallback to our context user.
          return user?.walletAddress === normalized;
        },
        doLogin: async (params: VerifyLoginPayloadParams) => {
          await loginDonor(params);
          router.refresh();
        },
        getLoginPayload: async ({ address }: { address: string }) =>
          // You can keep your existing generatePayload logic if needed.
          generatePayload({
            address: address.toLowerCase(),
            chainId: activeChain.id,
          }),
        doLogout: async () => {
          await logout();
          router.refresh();
        },
      }}
    />
  );
}
