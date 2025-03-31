import { Mail, Link } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { getCharityByWalletAddress } from "@/app/actions/charities";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";

export default async function DashboardFooter() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return <p>No user found.</p>;
  }

  const charity = await getCharityByWalletAddress(user.walletAddress);

  if (!charity) {
    return <p>No charity found.</p>;
  }

  const donationLink = `${process.env.NEXT_PUBLIC_DONATION_PAGE_ADDRESS}/${charity.slug}`;
  const email = "contact@digidov.com";

  return (
    <div className="fixed bottom-0 left-0 right-0 m-4 px-4 flex gap-2 justify-center items-center">
      <CopyButton
        text={donationLink}
        label="Copy Donation Link"
        leftIcon={<Link className="h-5 w-5" />}
        tooltip="Click to copy donation link"
      />
      <CopyButton
        text={email}
        label={email}
        leftIcon={<Mail className="h-5 w-5" />}
        tooltip="Click to copy email"
      />
    </div>
  );
}
