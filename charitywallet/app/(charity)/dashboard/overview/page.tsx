import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import TransactionHistory from "@/components/transaction-history-via-blockchain";
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
import CharitySetupModal from "@/components/new-charity-modal/charity-setup-modal";
import { SendingFundsModal } from "@/components/send-no-fee-transaction-modal";
import {
  DonationEvent,
  fetchDonationsToWallet,
} from "@/utils/fetch-contract-transactions";
import { ethereum } from "thirdweb/chains";
import { DonationReceipt } from "@/app/types/receipt";
import { getDonationReceiptsForCharity } from "@/app/actions/receipts";
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsCharts from "@/components/analytics-chart";
import { getCharityByWalletAddress } from "@/app/actions/charities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDonationLink } from "@/utils/get-donation-link";

export const revalidate = 60;

const COIN_IDS: Record<SupportedChain, string> = {
  ethereum: "ethereum",
  polygon: "matic-network",
};

const CONTRACT_ADDRESSES = {
  polygon: "0x1c8ed2efaed9f2d4f13e8f95973ac8b50a862ef0",
  ethereum: "0x27fede2dc50c03ef8c90bf1aa9cf69a3d181c9df",
};

export default async function Overview() {
  // 1) Check user authentication
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 2) Fetch charity data using the user's wallet address
  const charity = await getCharityByWalletAddress(user.walletAddress);
  if (!charity) {
    return <p>No charity found.</p>;
  }
  const isCharityComplete = charity.is_profile_complete ?? false;

  // 3) Fetch all necessary data
  const [donations, receipts, initialPriceData] = await Promise.all([
    fetchAllChainDonations(charity.wallet_address),
    fetchDonationReceipts(charity.wallet_address),
    fetchCryptoPrices(),
  ]);

  // 4) Aggregate donation receipts for the Analytics tab
  const monthlyAggregation: {
    [month: string]: { total: number; count: number; avg: number };
  } = {};

  receipts.forEach((receipt) => {
    const month = receipt.donation_date.substring(0, 7);
    if (!monthlyAggregation[month]) {
      monthlyAggregation[month] = { total: 0, count: 0, avg: 0 };
    }
    monthlyAggregation[month].total += receipt.fiat_amount;
    monthlyAggregation[month].count += 1;
  });

  Object.keys(monthlyAggregation).forEach((month) => {
    const { total, count } = monthlyAggregation[month];
    monthlyAggregation[month].avg = count > 0 ? total / count : 0;
  });

  const labels = Object.keys(monthlyAggregation).sort();
  const chartData = labels.map((month) => ({
    month,
    totalDonationAmount: monthlyAggregation[month].total,
    averageDonationAmount: monthlyAggregation[month].avg,
    donationCount: monthlyAggregation[month].count,
  }));

  const donationLink = charity.slug ? getDonationLink(charity.slug) : "";

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
                    <BreadcrumbPage>Overview</BreadcrumbPage>
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

          {/* Main content area */}
          <div className="pl-4 pr-0 py-6 flex-1">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="mb-4 w-full sm:w-auto">
                <TabsTrigger
                  value="transactions"
                  className="flex-1 sm:flex-initial"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 sm:flex-initial"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transactions">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Donation History</CardTitle>
                  <CardDescription>
                    You&apos;ve received {donations.length} donation
                    {donations.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                {isCharityComplete ? (
                  <div className="h-[calc(98vh-250px)] overflow-auto">
                    <TransactionHistory
                      donations={donations}
                      receipts={receipts}
                      donationLink={donationLink}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <p>No donations found.</p>
                    <CharitySetupModal walletAddress={user.walletAddress} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsCharts chartData={chartData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Data fetching utilities remain unchanged
async function fetchDonationReceipts(
  walletAddress: string
): Promise<DonationReceipt[]> {
  try {
    return await getDonationReceiptsForCharity(walletAddress);
  } catch (error) {
    console.error("Error fetching donation receipts:", error);
    return [];
  }
}

async function fetchDonationsFromChain(
  chainId: number,
  contractAddress: string,
  walletAddress: string
): Promise<DonationEvent[]> {
  try {
    return await fetchDonationsToWallet(
      chainId,
      contractAddress,
      walletAddress
    );
  } catch (error) {
    console.error(
      `Failed to fetch donation events from chain ${chainId}:`,
      error
    );
    return [];
  }
}

const fetchAllChainDonations = async (
  walletAddress: string
): Promise<DonationEvent[]> => {
  const [ethereumDonations] = await Promise.all([
    fetchDonationsFromChain(
      ethereum.id,
      CONTRACT_ADDRESSES.ethereum,
      walletAddress
    ),
    // Uncomment below to include Polygon donations:
    // fetchDonationsFromChain(
    //   polygon.id,
    //   CONTRACT_ADDRESSES.polygon,
    //   walletAddress
    // ),
  ]);
  return [...ethereumDonations];
};

async function fetchCryptoPrices() {
  const chains: SupportedChain[] = ["ethereum", "polygon"];
  const coinIds = chains.map((chain) => COIN_IDS[chain]).join(",");
  return await fetchPrices(coinIds, "usd");
}
