import { ReactNode } from "react";
import "@/lib/moralis";
import DashboardFooter from "./footer";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <main className="w-full flex-1">{children}</main>
      <DashboardFooter />
    </div>
  );
}
