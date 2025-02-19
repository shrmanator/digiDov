"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import ConnectWalletButton from "@/components/connect-wallet-button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Charity {
  charity_name?: string | null;
}

interface SideBarAndHeaderProps {
  charity: Charity;
}

export default function SideBarAndHeader({ charity }: SideBarAndHeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const account = useActiveAccount();

  useEffect(() => {
    if (account && account.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Donate</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {charity?.charity_name || "Charity Name"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center">
            <ConnectWalletButton setIsAuthenticated={setIsAuthenticated} />
          </div>
        </header>
        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md flex flex-col items-center">
            {isAuthenticated && account && account.address ? (
              <div>
                <h2>Welcome, {account.address}</h2>
                {/* Render your donation form and donor info here */}
              </div>
            ) : null}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
