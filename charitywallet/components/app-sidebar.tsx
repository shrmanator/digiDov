"use client";

import * as React from "react";
import { BarChart, BookDashed, Coins, Percent, User } from "lucide-react";
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

  const navData = {
    user: {
      name: charity?.charity_name || "Default Charity Name",
      email: charity?.contact_email || "default@example.com",
      avatar: charity?.avatar || "avatar",
    },
    teams: [
      {
        name: "SuperMint",
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
        title: "Tax Receipts",
        url: "/dashboard/tax-receipts",
        icon: Percent,
      },
      {
        title: "Charity Profile",
        url: "/dashboard/your-info",
        icon: User,
        // items: [
        //   { title: "Your Info", url: "#" },
        //   { title: "Billing", url: "#" },
        // ],
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
