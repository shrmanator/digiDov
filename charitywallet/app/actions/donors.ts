"use server";
import prisma from "@/lib/prisma";

export interface DonorInput {
  walletAddress: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
}

export async function upsertDonor(data: DonorInput) {
  const walletAddress = data.walletAddress.toLowerCase();
  return prisma.donors.upsert({
    where: { walletAddress },
    update: {
      email: data.email ?? undefined,
      firstName: data.firstName ?? undefined,
      lastName: data.lastName ?? undefined,
      address: data.address ?? undefined,
    },
    create: {
      walletAddress,
      email: data.email ?? null,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      address: data.address ?? null,
    },
  });
}

export async function updateDonorEmail(params: {
  walletAddress: string;
  email: string;
}) {
  const walletAddress = params.walletAddress.toLowerCase();
  return await prisma.donors.update({
    where: { walletAddress },
    data: {
      email: params.email,
    },
  });
}

export async function getDonorByWallet(walletAddress: string) {
  return prisma.donors.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
}
