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
import CombinedWalletBalance from "@/components/wallet-balance";
import Moralis from "moralis";
import DonationReceiptsList from "@/components/donation-receipt-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DonorLinkCopyButton } from "@/components/donor-link-copy-button";

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

  // 4) Fetch net worth and transactions concurrently
  const [netWorthResult] = await Promise.allSettled([
    Moralis.EvmApi.wallets.getWalletNetWorth({
      address: charity.wallet_address,
      excludeSpam: true,
      excludeUnverifiedContracts: true,
    }),
  ]);

  let netWorth: string | null = null;
  if (netWorthResult.status === "fulfilled") {
    netWorth = netWorthResult.value.raw?.total_networth_usd;
  } else {
    console.error("Error fetching net worth:", netWorthResult.reason);
  }

  const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charity.slug}`;

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
              <CombinedWalletBalance netWorth={netWorth} />
            </div>
          </header>
          <ScrollArea className="h-full mt-6">
            <DonationReceiptsList />
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
