"use server";

import prisma from "@/lib/prisma";

export interface CharityInput {
  charityName?: string | null;
  registeredAddress?: string | null;
  registrationNumber?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  walletAddress: string;
  isProfileComplete?: boolean;
}

export async function upsertCharity(data: CharityInput) {
  console.log("walletAddress", data.walletAddress);
  const walletAddress = data.walletAddress.toLowerCase();
  return prisma.charity.upsert({
    where: { wallet_address: walletAddress },
    update: {
      charity_name: data.charityName ?? undefined,
      registered_office_address: data.registeredAddress ?? undefined,
      registration_number: data.registrationNumber ?? undefined,
      contact_name: data.contactName ?? undefined,
      contact_email: data.contactEmail ?? undefined,
      contact_phone: data.contactPhone ?? undefined,
      ...(typeof data.isProfileComplete !== "undefined"
        ? { isProfileComplete: data.isProfileComplete }
        : {}),
    },
    create: {
      charity_name: data.charityName ?? null,
      registered_office_address: data.registeredAddress ?? null,
      registration_number: data.registrationNumber ?? null,
      contact_name: data.contactName ?? null,
      contact_email: data.contactEmail ?? null,
      contact_phone: data.contactPhone ?? null,
      wallet_address: walletAddress,
      is_profile_complete: data.isProfileComplete ?? false,
    },
  });
}

export async function updateCharityEmail(params: {
  walletAddress: string;
  email: string;
}) {
  const walletAddress = params.walletAddress.toLowerCase();
  return prisma.charity.update({
    where: { wallet_address: walletAddress },
    data: {
      contact_email: params.email,
    },
  });
}

export async function getCharityByWallet(walletAddress: string) {
  return prisma.charity.findUnique({
    where: { wallet_address: walletAddress },
  });
}
