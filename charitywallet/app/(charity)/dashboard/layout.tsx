import MoralisInitializer from "@/lib/moralis-initializer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <MoralisInitializer>
        <main className="w-full flex-1">{children}</main>
      </MoralisInitializer>
    </div>
  );
}
