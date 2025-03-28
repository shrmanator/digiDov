import { ReactNode } from "react";
import DashboardFooter from "./footer";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 overflow-hidden">{children}</main>
      <DashboardFooter />
    </div>
  );
}
