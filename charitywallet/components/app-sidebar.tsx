"use client";

import * as React from "react";
import { ClipboardList, Coins, Percent, User } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCharity } from "@/hooks/use-charity";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { charity } = useCharity();

  const navData = {
    user: {
      name: charity?.charity_name || "Default Charity Name",
      email: charity?.contact_email || "default@example.com",
      avatar: charity?.avatar || "avatar",
    },
    navMain: [
      {
        title: "Donations",
        url: "/dashboard/donations",
        icon: Coins,
      },
      {
        title: "Tax Receipts",
        url: "#",
        icon: Percent,
      },
      {
        title: "Your Info",
        url: "#",
        icon: User,
        // items: [
        //   { title: "Your Info", url: "#" },
        //   { title: "Billing", url: "#" },
        // ],
      },
      // {
      //   title: "Auditing",
      //   url: "#",
      //   icon: ClipboardList,
      // },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
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
