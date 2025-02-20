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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { polygon, ethereum } from "thirdweb/chains";

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
  // default chain is Polygon
  const [activeChain, setActiveChain] = useState(polygon);

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
          <div className="flex items-center gap-4">
            {/* Chain Selector using shadcn/ui Select */}
            <Select
              onValueChange={(value) =>
                setActiveChain(value === "ethereum" ? ethereum : polygon)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
              </SelectContent>
            </Select>
            <ConnectWalletButton
              setIsAuthenticated={setIsAuthenticated}
              activeChain={activeChain}
            />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
