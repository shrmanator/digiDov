import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";
import { getCharityByWallet } from "@/app/actions/charities";

export default async function DonatePage({
  params,
}: {
  params: { walletAddress: string };
}) {
  const { walletAddress } = await Promise.resolve(params);

  const charity = await getCharityByWallet(walletAddress.toLowerCase());

  if (!charity) {
    notFound();
  }

  return <SideBarAndHeader charity={charity} />;
}
