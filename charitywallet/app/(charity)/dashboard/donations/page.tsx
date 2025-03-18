import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
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
import { DonorLinkCopyButton } from "@/components/donor-link-copy-button";
import { SendingFundsModal } from "@/components/send-no-fee-transaction-modal";
import {
  DonationEvent,
  fetchDonationsToWallet,
} from "@/utils/fetch-contract-transactions";
import { polygon, ethereum } from "thirdweb/chains";
import { DonationReceipt } from "@/app/types/receipt";
import { getDonationReceipts } from "@/app/actions/receipts";
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";

// Control how often Next.js re-fetches data (in seconds)
export const revalidate = 60;

// Explicitly type COIN_IDS with SupportedChain keys.
const COIN_IDS: Record<SupportedChain, string> = {
  ethereum: "ethereum",
  polygon: "matic-network",
};

export default async function Dashboard() {
  // 1) Check user authentication
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  // 2) Fetch charity data using the user's wallet address
  const charity = await prisma.charity.findUnique({
    where: { wallet_address: user.walletAddress },
  });
  if (!charity) {
    return <p>No charity found.</p>;
  }
  const isCharityComplete = charity.is_profile_complete ?? false;

  // 3) Fetch net worth and donation events concurrently from two different chains
  const [donationsResultPolygon, donationsResultEthereum] =
    await Promise.allSettled([
      fetchDonationsToWallet(
        polygon.id,
        "0x1c8ed2efaed9f2d4f13e8f95973ac8b50a862ef0",
        charity.wallet_address
      ),
      fetchDonationsToWallet(
        ethereum.id,
        "0x27fede2dc50c03ef8c90bf1aa9cf69a3d181c9df",
        charity.wallet_address
      ),
    ]);

  let donations: DonationEvent[] = [];
  if (donationsResultPolygon.status === "fulfilled") {
    donations = donations.concat(donationsResultPolygon.value);
  } else {
    console.error(
      "Failed to fetch donation events from Polygon:",
      donationsResultPolygon.reason
    );
  }
  if (donationsResultEthereum.status === "fulfilled") {
    donations = donations.concat(donationsResultEthereum.value);
  } else {
    console.error(
      "Failed to fetch donation events from Ethereum:",
      donationsResultEthereum.reason
    );
  }

  // 4) Fetch donation receipts from the database
  let receipts: DonationReceipt[] = [];
  try {
    receipts = await getDonationReceipts();
  } catch (error) {
    console.error("Error fetching donation receipts:", error);
  }

  // 5) Construct the donation link for sharing
  const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charity.slug}`;

  // 6) Fetch price data on the server
  const chains: SupportedChain[] = ["ethereum", "polygon"];
  const coinIds = chains.map((chain) => COIN_IDS[chain]).join(",");
  const initialPriceData = await fetchPrices(coinIds, "usd");

  // 7) Render the dashboard
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
              />
              <CombinedWalletBalance
                initialPriceData={initialPriceData} // Pass the fetched price data here
                address={charity.wallet_address}
                client={client}
                currency="usd"
              />
            </div>
          </header>
          <main className="flex flex-1 p-6">
            <div className="w-full mx-auto flex flex-col items-center">
              <header className="mb-8 w-full">
                <h1 className="text-3xl font-bold mb-2">Donations</h1>
                <SendingFundsModal user={user} />
              </header>
              {isCharityComplete ? (
                <div className="w-full">
                  <TransactionHistory
                    donations={donations}
                    receipts={receipts}
                  />
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
