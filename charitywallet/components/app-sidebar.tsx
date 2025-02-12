"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCharity } from "@/hooks/use-charity";

// Import the custom hook that fetches charity details via your API.

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  // Fetch the charity record for the authenticated user.
  const { charity } = useCharity();

  // Create dynamic nav data using the charity info (with fallbacks).
  const navData = {
    user: {
      name: charity?.charity_name || "Default Charity Name",
      email: charity?.contact_email || "default@example.com",
      avatar: charity?.avatar || "/avatars/default.jpg",
    },
    navMain: [
      {
        title: "Your Info",
        url: "#",
        icon: Settings2,
        items: [
          { title: "Your Info", url: "#" },
          { title: "Billing", url: "#" },
        ],
      },
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
