import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import DonationReceiptsList from "@/components/donation-receipt-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DonorLinkCopyButton } from "@/components/donor-link-copy-button";
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";

export default async function Dashboard() {
  // 1) Check user
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 2) Fetch charity from DB
  const charity = await prisma.charity.findUnique({
    where: { wallet_address: user.walletAddress },
  });
  if (!charity) {
    return <p>No charity found.</p>;
  }

  // 3) Construct the donation link for sharing
  const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charity.slug}`;

  // 4) Fetch price data on the server using the new system
  const chains: SupportedChain[] = ["ethereum", "polygon"];
  const COIN_IDS: Record<SupportedChain, string> = {
    ethereum: "ethereum",
    polygon: "matic-network",
  };
  const coinIds = chains.map((chain) => COIN_IDS[chain]).join(",");
  const initialPriceData = await fetchPrices(coinIds, "usd");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Tax Receipts</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex flex-col items-end gap-1 mt-5">
              <DonorLinkCopyButton
                donorLink={donationLink}
                label="Click to copy donation page link"
              />
              <CombinedWalletBalance
                initialPriceData={initialPriceData}
                address={charity.wallet_address}
                client={client}
                currency="usd"
              />
            </div>
          </header>
          <ScrollArea className="h-full mt-6">
            <h2 className="px-4 text-2xl font-bold mb-4">Tax Receipts</h2>
            <DonationReceiptsList walletAddress={charity.wallet_address} />
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
