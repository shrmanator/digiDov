import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="w-full">
        <main className="w-full flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
