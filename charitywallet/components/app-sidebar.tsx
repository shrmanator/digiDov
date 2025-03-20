"use client";

import * as React from "react";
import { BarChart, BookDashed, Coins, FileText, User } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCharity } from "@/hooks/use-charity";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { charity } = useCharity();
  console.log("charity", charity);

  const navData = {
    user: {
      name: charity?.charity_name || "Default Charity Name",
      email: charity?.contact_email || "default@example.com",
      avatar: charity?.avatar || "avatar",
      walletAddress: charity?.wallet_address || "No Wallet Address",
    },
    teams: [
      {
        name: "Digidov",
        logo: BookDashed,
        plan: "Enterprise",
      },
    ],
    navMain: [
      {
        title: "Donations",
        url: "/dashboard/donations",
        icon: Coins,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart,
      },
      {
        title: "Audits",
        url: "/dashboard/audits",
        icon: FileText,
      },
      {
        title: "Charity Profile",
        url: "/dashboard/your-info",
        icon: User,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
