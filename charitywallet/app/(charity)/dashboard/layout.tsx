// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { initializeMoralis } from "@/lib/moralis";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await initializeMoralis();
  return (
    <div className="w-full">
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
