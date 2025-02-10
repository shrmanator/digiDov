import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/utils/getAuthenticatedUser";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    // If no valid user is found, redirect to the login page.
    redirect("/login");
  }

  // Query the charity record using the extracted wallet address.
  const charity = await prisma.charities.findUnique({
    where: { wallet_address: user.walletAddress },
  });

  // Render the page with the charity details.
  return (
    <div>
      <h1>Dashboard</h1>
      {charity ? (
        <>
          <h2>Charity Details</h2>
          <p>
            <strong>Legal Name:</strong> {charity.legal_name}
          </p>
          <p>
            <strong>Registered Address:</strong> {charity.registered_address}
          </p>
          <p>
            <strong>Registration Number:</strong> {charity.registration_number}
          </p>
          <p>
            <strong>Contact Name:</strong> {charity.contact_name}
          </p>
          <p>
            <strong>Contact Email:</strong> {charity.contact_email}
          </p>
          <p>
            <strong>Contact Phone:</strong> {charity.contact_phone}
          </p>
          <p>
            <strong>Wallet Address:</strong> {charity.wallet_address}
          </p>
        </>
      ) : (
        <div>
          <h2>Dashboard</h2>
          <p>
            No charity record found for your wallet. Please complete your
            charity registration.
          </p>
        </div>
      )}
    </div>
  );
}
