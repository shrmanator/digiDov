import { redirect } from "next/navigation";
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
import CharitySetupModal from "@/components/new-charity-modal/charity-setup-modal";
import { getDonationReceiptsForCharity } from "@/app/actions/receipts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsCharts from "@/components/analytics-chart";
import { getCharityByWalletAddress } from "@/app/actions/charities";
import { getDonationLink } from "@/utils/get-donation-link";
import DonationHistory from "@/components/transaction-history-via-db";
import SendingFundsModal from "@/components/sending-funds-modal";
import TotalUsdcBalance from "@/components/total-usdc-balance";

export const revalidate = 60;

export default async function Overview() {
  // 1) Auth
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  // 2) Charity lookup
  const charity = await getCharityByWalletAddress(user.walletAddress);
  if (!charity) return <p>No charity found.</p>;
  const isCharityComplete = charity.is_profile_complete ?? false;

  // 3) Fetch from DB + price data in parallel
  const [receipts] = await Promise.all([
    getDonationReceiptsForCharity(charity.wallet_address),
  ]);

  // 4) Build analytics data off receipts
  const monthlyAgg: Record<string, { total: number; count: number }> = {};
  receipts.forEach((r) => {
    const month = r.donation_date.substring(0, 7);
    if (!monthlyAgg[month]) monthlyAgg[month] = { total: 0, count: 0 };
    monthlyAgg[month].total += r.fiat_amount;
    monthlyAgg[month].count += 1;
  });
  const labels = Object.keys(monthlyAgg).sort();
  const chartData = labels.map((month) => ({
    month,
    totalDonationAmount: monthlyAgg[month].total,
    averageDonationAmount: monthlyAgg[month].total / monthlyAgg[month].count,
    donationCount: monthlyAgg[month].count,
  }));

  const donationLink = charity.slug ? getDonationLink(charity.slug) : "";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
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
                <TotalUsdcBalance address={charity.wallet_address} />
              </div>
              <div className="mt-1">
                <SendingFundsModal
                  charity={{
                    wallet_address: charity.wallet_address,
                    contact_email: charity.contact_email ?? "no contact email",
                  }}
                />
              </div>
            </div>
          </header>

          <div className="pl-4 py-6 flex-1">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <Tabs defaultValue="transactions">
              <TabsList className="mb-4">
                <TabsTrigger value="transactions" className="flex-1">
                  Donations ({receipts.length})
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                {isCharityComplete ? (
                  <div className="overflow-auto">
                    <DonationHistory
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
