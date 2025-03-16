"use client";

import { useState } from "react";
import { ChevronsUpDown, LogOut, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    walletAddress: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleCopy = async () => {
    if (user.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitial = (name: string) =>
    name ? name.charAt(0).toUpperCase() : "?";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitial(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Info Section */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitial(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Wallet Address Section */}
            {user.walletAddress && (
              <div
                onClick={handleCopy}
                className="
                  group
                  flex items-center 
                  cursor-pointer 
                  text-xs 
                  max-w-[150px]
                  mx-3
                  my-1
                  whitespace-nowrap 
                  overflow-hidden 
                  text-ellipsis
                "
                title={user.walletAddress}
              >
                <span className="font-bold mr-1">Wallet Addr:</span>
                <span className="truncate flex-1">{user.walletAddress}</span>
                <div className="ml-1">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </div>
              </div>
            )}

            {/* Logout Section */}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
