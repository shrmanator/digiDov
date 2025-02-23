import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";
import DonationForm from "@/components/donation-form";
import { getCharityBySlug } from "@/app/actions/charities";

export default async function DonatePage({
  params,
}: {
  params: { slug: string };
}) {
  // Wrap params in a Promise to satisfy Next.js requirements
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;
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
