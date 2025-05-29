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
import { TaxReceiptDrawer } from "@/components/tax-receipt-drawer";
import { Icon } from "@iconify/react";
import ethIcon from "@iconify/icons-cryptocurrency/eth";
import maticIcon from "@iconify/icons-cryptocurrency/matic";
import { polygon, ethereum } from "thirdweb/chains";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import DonorConnectWalletButton from "@/components/donor-connect-wallet-button";
import DonorProfileModal from "@/components/new-donor-modal/new-donor-modal";
import { useAuth } from "@/contexts/auth-context";

interface Charity {
  charity_name?: string | null;
  id: string;
}

interface SideBarAndHeaderProps {
  charity: Charity;
  children?: React.ReactNode;
}

export default function SideBarAndHeader({
  children,
}: SideBarAndHeaderProps) {
  const [, setIsAuthenticated] = useState(false);
  const account = useActiveAccount();
  const { user, donor } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeChain, setActiveChain] = useState(ethereum); // default
  const [showDonorModal, setShowDonorModal] = useState(false);

  // mark user authenticated once wallet connects
  useEffect(() => {
    if (account?.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  // prompt for profile completion
  useEffect(() => {
    if (donor && !donor.is_profile_complete) {
      setShowDonorModal(true);
    }
  }, [donor]);

  const handleChainChange = (value: string) => {
    setActiveChain(value === "polygon" ? polygon : ethereum);
  };

  const currentIcon = activeChain === polygon ? maticIcon : ethIcon;
  const currentLabel = activeChain === polygon ? "POL" : "ETH";

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-[100px] h-[52px] flex items-center justify-center gap-2"
              onClick={() => setIsDrawerOpen(true)}
            >
              <FileText className="w-5 h-5" />
              Receipts
            </Button>

            <TaxReceiptDrawer
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              walletAddress={account?.address ?? ""}
            />
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={activeChain === polygon ? "polygon" : "ethereum"}
              onValueChange={handleChainChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Icon icon={currentIcon} width="20" />
                    {currentLabel}
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
                  <div className="flex items-center gap-2">
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

      {donor && (
        <DonorProfileModal
          walletAddress={user?.walletAddress ?? ""}
          open={showDonorModal}
          onClose={() => setShowDonorModal(false)}
        />
      )}
    </SidebarProvider>
  );
}
