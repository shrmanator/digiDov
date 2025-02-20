import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";
import { getCharityByWallet } from "@/app/actions/charities";
import DonationForm from "@/components/donation-form";

export default async function DonatePage({
  params,
}: {
  params: { walletAddress: string };
}) {
  const { walletAddress } = await params;
  const charity = await getCharityByWallet(walletAddress.toLowerCase());

  if (!charity) {
    notFound();
  }

  return (
    <SideBarAndHeader charity={charity}>
      <DonationForm charityWalletAddress={charity.wallet_address} />
    </SideBarAndHeader>
  );
}
