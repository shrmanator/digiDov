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
import { updateCharityProfile } from "@/app/actions/charities";

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
          </header>

          <div className="px-4 py-6 flex-1 overflow-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="bg-card shadow rounded-md p-6">
              <form
                action={updateCharityProfile}
                method="post"
                className="space-y-4"
              >
                <input
                  type="hidden"
                  name="wallet_address"
                  value={charity.wallet_address}
                />

                <div>
                  <label
                    htmlFor="charity_name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Charity Name
                  </label>
                  <input
                    type="text"
                    id="charity_name"
                    name="charity_name"
                    defaultValue={charity.charity_name || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="registered_address"
                    className="block text-sm font-medium text-foreground"
                  >
                    Registered Address
                  </label>
                  <input
                    type="text"
                    id="registered_address"
                    name="registered_address"
                    defaultValue={charity.registered_office_address || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="registration_number"
                    className="block text-sm font-medium text-foreground"
                  >
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="registration_number"
                    name="registration_number"
                    defaultValue={charity.registration_number || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_first_name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contact First Name
                  </label>
                  <input
                    type="text"
                    id="contact_first_name"
                    name="contact_first_name"
                    defaultValue={charity.contact_first_name || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_last_name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contact Last Name
                  </label>
                  <input
                    type="text"
                    id="contact_last_name"
                    name="contact_last_name"
                    defaultValue={charity.contact_last_name || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    defaultValue={charity.contact_email || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_phone"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    name="contact_phone"
                    defaultValue={charity.contact_mobile_phone || ""}
                    className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
