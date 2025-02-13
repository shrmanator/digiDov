// app/page.tsx
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

export default async function Page() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const charity = await prisma.charities.findUnique({
    where: { wallet_address: user.walletAddress },
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Force the SidebarInset to be full height */}
      <SidebarInset className="h-screen">
        <div className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear">
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
            {charity && (
              <div className="hidden md:block">
                <WalletCopyButton walletAddress={charity.wallet_address} />
              </div>
            )}
          </header>
          {/* Main area takes the remaining space and centers its content */}
          <main className="flex flex-1 items-center justify-center">
            {charity ? (
              <div>
                <TransactionHistory
                  walletAddress={charity.wallet_address}
                  chainId="1"
                />
              </div>
            ) : (
              <p className="text-center">
                No charity record found. Please complete your charity
                registration.
              </p>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
