// app/actions/charities.ts
import prisma from "@/lib/prisma"; // Ensure you have this file set up to export your PrismaClient instance

export interface CharityInput {
  legal_name: string;
  registered_address: string;
  registration_number: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  wallet_address: string;
}

export async function upsertCharity(data: CharityInput) {
  // Normalize the wallet address to ensure consistency (e.g., all lowercase)
  const walletAddress = data.wallet_address.toLowerCase();

  return prisma.charities.upsert({
    where: { wallet_address: walletAddress },
    update: {
      legal_name: data.legal_name,
      registered_address: data.registered_address,
      registration_number: data.registration_number,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
    },
    create: {
      legal_name: data.legal_name,
      registered_address: data.registered_address,
      registration_number: data.registration_number,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      wallet_address: walletAddress,
    },
  });
}
