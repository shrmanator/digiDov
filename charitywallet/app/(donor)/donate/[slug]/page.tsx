import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";
import DonationForm from "@/components/donation-form/donation-form";
import { getCharityBySlug } from "@/app/actions/charities";
import LoginButton from "@/components/thirdweb-login-button";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const charity = await getCharityBySlug(slug);

  if (!charity) {
    notFound();
  }

  return (
    <SideBarAndHeader charity={charity}>
      <DonationForm charity={charity} />
    </SideBarAndHeader>
  );
}
