"use client";
import { useActiveAccount } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";

interface WalletInfoProps {
  truncated?: boolean;
}

export default function WalletInfo({ truncated = false }: WalletInfoProps) {
  const account = useActiveAccount();
  const displayAddress =
    account?.address && truncated
      ? shortenAddress(account.address)
      : account?.address;

  return (
    <div>
      <p>{displayAddress || "No wallet connected"}</p>
    </div>
  );
}
