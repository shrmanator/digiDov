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
  id: string;
}

interface SideBarAndHeaderProps {
  charity: Charity;
  children?: React.ReactNode;
}

export default function SideBarAndHeader({
  charity,
  children,
}: SideBarAndHeaderProps) {
  const [, setIsAuthenticated] = useState(false);
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
        <main className="flex flex-1 items-center justify-center p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
