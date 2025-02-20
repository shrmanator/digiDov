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
  const walletAddress = data.walletAddress.toLowerCase();
  return prisma.charity.upsert({
    where: { walletAddress },
    update: {
      charityName: data.charityName ?? undefined,
      registeredAddress: data.registeredAddress ?? undefined,
      registrationNumber: data.registrationNumber ?? undefined,
      contactName: data.contactName ?? undefined,
      contactEmail: data.contactEmail ?? undefined,
      contactPhone: data.contactPhone ?? undefined,
      ...(typeof data.isProfileComplete !== "undefined"
        ? { isProfileComplete: data.isProfileComplete }
        : {}),
    },
    create: {
      charityName: data.charityName ?? null,
      registeredAddress: data.registeredAddress ?? null,
      registrationNumber: data.registrationNumber ?? null,
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
      contactPhone: data.contactPhone ?? null,
      walletAddress: walletAddress,
      isProfileComplete: data.isProfileComplete ?? false,
    },
  });
}

export async function updateCharityEmail(params: {
  walletAddress: string;
  email: string;
}) {
  const walletAddress = params.walletAddress.toLowerCase();
  return prisma.charity.update({
    where: { walletAddress },
    data: {
      contactEmail: params.email,
    },
  });
}

export async function getCharityByWallet(walletAddress: string) {
  return prisma.charity.findUnique({
    where: { walletAddress },
  });
}
