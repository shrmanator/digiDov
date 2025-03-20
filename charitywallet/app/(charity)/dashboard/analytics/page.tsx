// app/dashboard/page.tsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DonationReceiptsList from "@/components/donation-receipt-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DonorLinkCopyButton } from "@/components/donor-link-copy-button";
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";
import ExternalWalletTransfersList from "@/components/external-fund-transfer-list";
import { getDonationReceiptsForCharity } from "@/app/actions/receipts";
import AnalyticsCharts from "@/components/analytics-chart";

export default async function Dashboard() {
  // 1) Check user authentication
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

  // 5) Fetch donation receipts for analytics and aggregate by month
  const donationReceipts = await getDonationReceiptsForCharity(
    user.walletAddress
  );
  const monthlyAggregation: { [month: string]: number } = {};
  donationReceipts.forEach((receipt) => {
    // Assume receipt.donation_date is an ISO string ("YYYY-MM-DD...") and receipt.fiat_amount is a number.
    const month = receipt.donation_date.substring(0, 7);
    monthlyAggregation[month] =
      (monthlyAggregation[month] || 0) + receipt.fiat_amount;
  });
  const labels = Object.keys(monthlyAggregation).sort();
  const chartData = labels.map((month) => ({
    month,
    donation: monthlyAggregation[month],
  }));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <div className="flex flex-col h-full">
          {/* Header with Sidebar Trigger, Breadcrumbs, and Wallet Info */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear">
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
                    <BreadcrumbPage>Audits</BreadcrumbPage>
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

          <div className="px-4 py-6">
            <h2 className="text-2xl font-bold mb-6">Audits & Analytics</h2>

            <Tabs defaultValue="taxReceipts" className="w-full">
              <TabsList className="mb-4 w-full sm:w-auto">
                <TabsTrigger
                  value="taxReceipts"
                  className="flex-1 sm:flex-initial"
                >
                  Tax Receipts
                </TabsTrigger>
                <TabsTrigger
                  value="externalWalletTransfers"
                  className="flex-1 sm:flex-initial"
                >
                  Wallet Withdraws
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 sm:flex-initial"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="taxReceipts">
                <ScrollArea className="h-[calc(98vh-250px)]">
                  <DonationReceiptsList
                    walletAddress={charity.wallet_address}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="externalWalletTransfers">
                <ScrollArea className="h-[calc(98vh-250px)]">
                  <ExternalWalletTransfersList charityId={charity.id} />
                </ScrollArea>
              </TabsContent>

              {/* New Analytics Tab */}
              <TabsContent value="analytics">
                <ScrollArea className="h-[calc(98vh-250px)]">
                  <AnalyticsCharts chartData={chartData} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
