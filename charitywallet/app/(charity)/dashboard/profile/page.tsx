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
import ProfileForm from "@/components/profile-form";
import CombinedWalletBalance, {
  SupportedChain,
} from "@/components/combine-wallet-balance";
import { SendingFundsModal } from "@/components/send-no-fee-transaction-modal";
import { client } from "@/lib/thirdwebClient";
import { fetchPrices } from "@/utils/convert-crypto-to-fiat";

export default async function Profile() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const charity = await prisma.charity.findUnique({
    where: { wallet_address: user.walletAddress },
  });
  if (!charity) {
    return <p>No charity found.</p>;
  }

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
                    <BreadcrumbPage>Profile</BreadcrumbPage>
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
          <div className="px-4 py-6 flex-1 overflow-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="bg-card shadow rounded-md p-6">
              <ProfileForm charity={charity} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
