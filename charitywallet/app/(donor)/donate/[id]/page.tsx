"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const account = useActiveAccount();

  // When account becomes available, mark as authenticated
  useEffect(() => {
    if (account && account.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        {!isAuthenticated ? (
          <ConnectEmbed
            client={client}
            welcomeScreen={{
              title: "Your gateway to a new era of giving",
              subtitle: `Connect wallet to donate to ${
                charity?.name || "Charity"
              }`,
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
                // We rely on the useEffect to update isAuthenticated when account becomes available.
              },
              getLoginPayload: async ({ address }) =>
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
        ) : // Once authenticated, display donor-specific info and donation form if account info is loaded.
        account && account.address ? (
          <div>
            <h2>Welcome, {account.address}</h2>
            {/* Render your donation form and donor info here */}
          </div>
        ) : (
          <p>Loading account information...</p>
        )}
      </div>
    </div>
  );
}
