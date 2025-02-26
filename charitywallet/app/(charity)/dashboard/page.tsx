// app/dashboard/page.tsx

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
import { WalletCopyButton } from "@/components/wallet-copy-button";
import CharitySetupModal from "@/components/new-charity-modal/charity-setup-modal";
import CombinedWalletBalance from "@/components/wallet-balance";
import { initializeMoralis } from "@/lib/moralis";
// 1) Import TransactionWithType so TS knows the shape of your transaction array
import { fetchTransactions, TransactionWithType } from "@/utils/moralis-utils";

// RECOMMENDED: control how often Next.js re-fetches data (in seconds).
// If you do not want any caching, remove this line or set dynamic = "force-dynamic".
export const revalidate = 60;

export default async function Dashboard() {
  // 2) Check user
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 3) Fetch charity from DB
  const charity = await prisma.charity.findUnique({
    where: { wallet_address: user.walletAddress },
  });
  if (!charity) {
    return <p>No charity found.</p>;
  }

  const isCharityComplete = charity.is_profile_complete ?? false;

  // 4) Initialize Moralis once
  await initializeMoralis();

  // 5) Explicitly type transactions as TransactionWithType[]
  let transactions: TransactionWithType[] = [];
  try {
    transactions = await fetchTransactions(charity.wallet_address, "received");
  } catch (error) {
    console.error("Failed to fetch transactions from Moralis:", error);
  }

  // 6) Render
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
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex flex-col items-end gap-1 mt-5">
              <WalletCopyButton walletAddress={charity.wallet_address} />
              <CombinedWalletBalance
                searchParams={{ address: charity.wallet_address }}
              />
            </div>
          </header>
          <main className="flex flex-1 p-6">
            <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
              <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Donations</h1>
              </header>
              {isCharityComplete ? (
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-2xl mx-auto">
                    {/* Pass the fetched transactions to TransactionHistory */}
                    <TransactionHistory transactions={transactions} />
                  </div>
                </div>
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
