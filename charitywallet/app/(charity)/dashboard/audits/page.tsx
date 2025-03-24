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
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";
import ExternalWalletTransfersList from "@/components/external-fund-transfer-list";
import { SendingFundsModal } from "@/components/send-no-fee-transaction-modal";

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

  // 3) Fetch price data on the server using the new system
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
            <div className="flex flex-col items-end gap-1 mt-10">
              <div className="mt-1">
                <CombinedWalletBalance
                  initialPriceData={initialPriceData}
                  address={charity.wallet_address}
                  client={client}
                  currency="usd"
                />
              </div>
              <div className="mt-1">
                <SendingFundsModal user={user} />
              </div>
            </div>
          </header>

          <div className="px-4 py-6">
            <h2 className="text-2xl font-bold mb-6">Audits</h2>

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
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
