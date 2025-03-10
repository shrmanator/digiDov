import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
