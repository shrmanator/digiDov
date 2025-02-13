import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="w-full">
        <main className="flex items-center justify-center">{children}</main>
      </div>
    </SidebarProvider>
  );
}
