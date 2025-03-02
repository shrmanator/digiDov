"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DonorConnectWalletButton from "@/components/connect-wallet-button";
import { TaxReceiptDrawer } from "@/components/tax-receipt-drawer";
import { Icon } from "@iconify/react";
import ethIcon from "@iconify/icons-cryptocurrency/eth";
import maticIcon from "@iconify/icons-cryptocurrency/matic";
import { polygon, ethereum } from "thirdweb/chains";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeChain, setActiveChain] = useState(ethereum); // Default to Ethereum

  useEffect(() => {
    if (account && account.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  const currentIcon = activeChain === polygon ? maticIcon : ethIcon;
  const currentLabel = activeChain === polygon ? "POL" : "ETH";

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-[100px] h-[52px] flex items-center justify-center gap-2"
              onClick={() => setIsDrawerOpen(true)}
            >
              <FileText className="w-5 h-5" /> {/* Icon next to text */}
              Receipts
            </Button>
            <TaxReceiptDrawer
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={activeChain === polygon ? "polygon" : "ethereum"}
              onValueChange={(value) =>
                setActiveChain(value === "ethereum" ? ethereum : polygon)
              }
            >
              <SelectTrigger
                className="w-[100px] h-[52px]"
                aria-label="Select chain"
              >
                <SelectValue>
                  <div className="flex items-center gap-1">
                    <Icon icon={currentIcon} width="25" />
                    <span>{currentLabel}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">
                  <div className="flex items-center gap-2">
                    <Icon icon={ethIcon} width="25" />
                    ETH
                  </div>
                </SelectItem>
                <SelectItem value="polygon">
                  <div className="flex items-center gap-1">
                    <Icon icon={maticIcon} width="25" />
                    POL
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <DonorConnectWalletButton activeChain={activeChain} />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
