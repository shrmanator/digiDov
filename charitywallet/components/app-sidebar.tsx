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

// Assume useCharity is a custom hook that returns dynamic charity details.
// For example, it might fetch the charity record from your API or use a global state.
import { useCharity } from "@/hooks/useCharity";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const charity = useCharity(); // Returns an object { name, email, avatar } or similar

  // Create dynamic nav data using the charity info (falling back to defaults if needed)
  const navData = {
    user: {
      name: charity?.name || "Default Charity Name",
      email: charity?.email || "default@example.com",
      avatar: charity?.avatar || "/avatars/default.jpg",
    },
    navMain: [
      {
        title: "Your Info",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "Your Info",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
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
