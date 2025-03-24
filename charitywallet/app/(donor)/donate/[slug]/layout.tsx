import { ReactNode } from "react";
import "@/lib/moralis"; // This is just here so Moralis is initialized
import DonateFooter from "./footer";

export default async function DonateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <main className="w-full flex-1">{children}</main>
      <DonateFooter />
    </div>
  );
}
