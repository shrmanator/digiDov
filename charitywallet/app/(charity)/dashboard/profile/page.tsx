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

import ProfileWithOtp from "@/components/profile-form-with-otp/profile-form-with-otp";
import SendingFundsModal from "@/components/sending-funds-modal";
import TotalUsdcBalance from "@/components/total-usdc-balance";

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
          <div className="px-4 py-6 flex-1 overflow-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="bg-card shadow rounded-md p-6">
              <ProfileWithOtp charity={charity} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
