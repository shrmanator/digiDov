import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Replacing the aspect-video grid with Dashboard content */}
          <div className="container mx-auto p-6">
            {charity ? (
              <div className="space-y-6">
                {/* Charity Information Section */}
                <div>
                  <h1 className="text-3xl font-bold">{charity.charity_name}</h1>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Registered Address:</span>{" "}
                      {charity.registered_address}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Registration Number:
                      </span>{" "}
                      {charity.registration_number}
                    </p>
                    <p>
                      <span className="font-semibold">Contact Name:</span>{" "}
                      {charity.contact_name}
                    </p>
                    <p>
                      <span className="font-semibold">Contact Email:</span>{" "}
                      {charity.contact_email}
                    </p>
                    <p>
                      <span className="font-semibold">Contact Phone:</span>{" "}
                      {charity.contact_phone}
                    </p>
                    <p>
                      <span className="font-semibold">Wallet Address:</span>{" "}
                      {charity.wallet_address}
                    </p>
                  </div>
                </div>

                {/* Tabs Section for Normal and Audit Views */}
                <Tabs defaultValue="normal" className="mt-6">
                  <TabsList className="mb-4">
                    <TabsTrigger value="normal">Normal View</TabsTrigger>
                    <TabsTrigger value="audit">Audit View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="normal">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Overview</h3>
                      <p>Current USDC Balance: (placeholder)</p>
                      <p>Recent Donations: (placeholder)</p>
                      <p>
                        Please paste your wallet address on your website so that
                        donors can send ETH (or POL) directly.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="audit">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Audit Details</h3>
                      <p>Detailed Transaction Logs: (placeholder)</p>
                      <p>
                        Conversion History (from ETH to USDC): (placeholder)
                      </p>
                      <p>
                        Export reports and audit logs here for regulatory
                        reporting.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p>
                  No charity record found for your wallet. Please complete your
                  charity registration.
                </p>
              </div>
            )}
          </div>
          {/* Optional: Retain other content if needed */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
