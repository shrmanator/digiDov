import Moralis from "moralis";
import { initializeMoralis } from "@/lib/moralis";

export const dynamic = "force-dynamic"; // Ensures data is fetched on each request

interface CombinedWalletNetWorthProps {
  searchParams: { address?: string };
}

export default async function CombinedWalletNetWorth({
  searchParams,
}: CombinedWalletNetWorthProps) {
  const address = searchParams.address;

  if (!address) {
    return <div>Please provide a wallet address.</div>;
  }

  await initializeMoralis();

  let netWorth: string | null = null;
  try {
    const response = await Moralis.EvmApi.wallets.getWalletNetWorth({
      address,
      excludeSpam: true,
      excludeUnverifiedContracts: true,
    });
    netWorth = response.raw?.total_networth_usd;
  } catch (error) {
    console.error("Error fetching net worth:", error);
  }

  return (
    <div className="text-sm font-mono mr-2.5">
      Total donations: ~${netWorth ? parseFloat(netWorth).toFixed(2) : "N/A"} USD
    </div>
  );
}
