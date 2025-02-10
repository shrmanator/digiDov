"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useDisconnect, useActiveWallet } from "thirdweb/react";

export default function DashboardHeader() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const handleLogout = async () => {
    await logout();
    if (wallet) {
      disconnect(wallet);
    }
    router.push("/login");
  };

  return (
    <header className="p-4 border-b flex items-center justify-between">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <button
        type="button"
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Sign Out
      </button>
    </header>
  );
}
