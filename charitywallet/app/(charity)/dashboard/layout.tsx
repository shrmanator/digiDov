export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
