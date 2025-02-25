"use client";
import { AutoConnect } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { inAppWallet } from "thirdweb/wallets";

const wallets = [inAppWallet()];

const appMetadata = {
  name: "SuperMint Wallet",
  iconURL: "https://myapp.com/icon.png",
  logoURL: "https://myapp.com/logo.png",
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
