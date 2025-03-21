"use client";
import { AutoConnect } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { inAppWallet } from "thirdweb/wallets";

const wallets = [inAppWallet()];

const appMetadata = {
  name: "Digidov Wallet",
  iconURL: "/favicon.png",
  logoURL: "/favicon.png",
};

export default function ThirdwebAutoConnect() {
  return (
    <AutoConnect
      client={client}
      timeout={10000}
      wallets={wallets}
      appMetadata={appMetadata}
    />
  );
}
