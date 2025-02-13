// app/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";
import TransactionHistory from "@/components/transaction-history";

export default async function Page() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const charity = await prisma.charities.findUnique({
    where: { wallet_address: user.walletAddress },
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      {charity ? (
        <div className="w-full max-w-4xl mx-auto">
          <TransactionHistory
            walletAddress={charity.wallet_address}
            chainId="1"
          />
        </div>
      ) : (
        <p className="text-center">
          No charity record found. Please complete your charity registration.
        </p>
      )}
    </div>
  );
}
