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
      charity_name: data.charity_name ?? undefined,
      registered_address: data.registered_address ?? undefined,
      registration_number: data.registration_number ?? undefined,
      contact_name: data.contact_name ?? undefined,
      contact_email: data.contact_email ?? undefined,
      contact_phone: data.contact_phone ?? undefined,
      isProfileComplete: data.isProfileComplete ?? false,
    },
    create: {
      charity_name: data.charity_name ?? null,
      registered_address: data.registered_address ?? null,
      registration_number: data.registration_number ?? null,
      contact_name: data.contact_name ?? null,
      contact_email: data.contact_email ?? null,
      contact_phone: data.contact_phone ?? null,
      wallet_address: walletAddress,
      isProfileComplete: data.isProfileComplete ?? false,
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
