import Moralis from "moralis";

// Cache the data for 60 seconds (adjust as needed)
export const revalidate = 60;

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

  let netWorth: string | null = null;
  try {
    console.log("Fetching net worth for address:", address);
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
      Total donations: ~$
      {netWorth ? parseFloat(netWorth).toFixed(2) : "N/A"} USD
    </div>
  );
}
