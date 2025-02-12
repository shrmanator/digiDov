"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useDisconnect, useActiveWallet } from "thirdweb/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Diamond } from "lucide-react";

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="User menu"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white"
          >
            <Diamond size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
