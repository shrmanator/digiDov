"use server";

import prisma from "@/lib/prisma";

export interface CharityInput {
  charity_name?: string | null;
  registered_address?: string | null;
  registration_number?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  wallet_address: string;
  isProfileComplete?: boolean;
}

export async function upsertCharity(data: CharityInput) {
  const walletAddress = data.wallet_address.toLowerCase();
  return prisma.charities.upsert({
    where: { wallet_address: walletAddress },
    update: {
      charity_name: data.charity_name,
      registered_address: data.registered_address,
      registration_number: data.registration_number,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      isProfileComplete: true, // Mark profile as complete on update
    },
    create: {
      charity_name: data.charity_name,
      registered_address: data.registered_address,
      registration_number: data.registration_number,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      wallet_address: walletAddress,
      isProfileComplete: true, // Mark profile as complete on creation
    },
  });
}

export async function updateCharityEmail(params: {
  walletAddress: string;
  email: string;
}) {
  const walletAddress = params.walletAddress.toLowerCase();
  return await prisma.charities.update({
    where: { wallet_address: walletAddress },
    data: {
      contact_email: params.email,
    },
  });
}
