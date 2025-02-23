import { getCharityBySlug } from "@/app/actions/charities";
import DonationForm from "@/components/donation-form";
import { notFound } from "next/navigation";
import SideBarAndHeader from "./donate-sidebar-and-header";

function resolveParams<T>(params: T): Promise<T> {
  return Promise.resolve(params);
}

export default async function DonatePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await resolveParams(params);
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
