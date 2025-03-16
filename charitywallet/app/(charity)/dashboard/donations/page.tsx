import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import TransactionHistory from "@/components/transaction-history";
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
import CombinedWalletBalance from "@/components/wallet-balance";
import { fetchTransactions, TransactionWithType } from "@/utils/moralis-utils";
import Moralis from "moralis";
import { DonorLinkCopyButton } from "@/components/donor-link-copy-button";
import { TransactionModal } from "@/components/send-no-fee-transaction-modal";

// Control how often Next.js re-fetches data (in seconds)
export const revalidate = 60;

export default async function Dashboard() {
  // 1) Check user authentication
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 2) Fetch charity data
  const charity = await prisma.charity.findUnique({
    where: { wallet_address: user.walletAddress },
  });
  if (!charity) {
    return <p>No charity found.</p>;
  }
  const isCharityComplete = charity.is_profile_complete ?? false;

  // 3) Fetch net worth and transactions concurrently
  const [netWorthResult, transactionsResult] = await Promise.allSettled([
    Moralis.EvmApi.wallets.getWalletNetWorth({
      address: charity.wallet_address,
      excludeSpam: true,
      excludeUnverifiedContracts: true,
    }),
    fetchTransactions(charity.wallet_address, "received"),
  ]);

  let netWorth: string | null = null;
  if (netWorthResult.status === "fulfilled") {
    netWorth = netWorthResult.value.raw?.total_networth_usd;
  } else {
    console.error("Error fetching net worth:", netWorthResult.reason);
  }

  let transactions: TransactionWithType[] = [];
  if (transactionsResult.status === "fulfilled") {
    transactions = transactionsResult.value;
  } else {
    console.error(
      "Failed to fetch transactions from Moralis:",
      transactionsResult.reason
    );
  }

  // 4) Construct the donation link
  const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charity.slug}`;

  // 5) Render the dashboard
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
                    <BreadcrumbPage>Donations</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex flex-col items-end gap-1 mt-5">
              <DonorLinkCopyButton
                donorLink={donationLink}
                label="Click to copy donation page link"
              />{" "}
              <CombinedWalletBalance netWorth={netWorth} />
            </div>
          </header>
          <main className="flex flex-1 p-6">
            <div className="w-full mx-auto flex flex-col items-center">
              <header className="mb-8 w-full">
                <h1 className="text-3xl font-bold mb-2">Donations</h1>
                <TransactionModal />
              </header>
              {isCharityComplete ? (
                <>
                  {/* Transaction History */}
                  <div className="w-full">
                    {/* <TransactionHistory transactions={transactions} /> */}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-center">No donations found.</p>
                  <CharitySetupModal walletAddress={user.walletAddress} />
                </>
              )}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
