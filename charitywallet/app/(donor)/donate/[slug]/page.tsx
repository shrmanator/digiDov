import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";
import DonationForm from "@/components/donation-form";
import { getCharityBySlug } from "@/app/actions/charities";

export default async function DonatePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  return (
    <SideBarAndHeader charity={charity}>
      <DonationForm charityWalletAddress={charity.wallet_address} />
    </SideBarAndHeader>
  );
}
