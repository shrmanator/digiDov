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

export default function ClientDonate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const account = useActiveAccount();

  useEffect(() => {
    if (account && account.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* Header with Breadcrumbs */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">SuperMint</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Donate</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md flex flex-col items-center">
            {!isAuthenticated ? (
              <ConnectWalletButton setIsAuthenticated={setIsAuthenticated} />
            ) : account && account.address ? (
              <div>
                <h2>Welcome, {account.address}</h2>
                {/* Render your donation form and donor info here */}
              </div>
            ) : (
              <p>Loading account information...</p>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
