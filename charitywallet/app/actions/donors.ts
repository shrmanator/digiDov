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
  return prisma.donor.upsert({
    where: { wallet_address: walletAddress },
    update: {
      email: data.email ?? undefined,
      first_name: data.firstName ?? undefined,
      last_name: data.lastName ?? undefined,
      address: data.address ?? undefined,
    },
    create: {
      wallet_address: walletAddress,
      email: data.email ?? null,
      first_name: data.firstName ?? null,
      last_name: data.lastName ?? null,
      address: data.address ?? null,
    },
  });
}

export async function updateDonorEmail(params: {
  walletAddress: string;
  email: string;
}) {
  const walletAddress = params.walletAddress.toLowerCase();
  return await prisma.donor.update({
    where: { wallet_address: walletAddress },
    data: {
      email: params.email,
    },
  });
}

export async function getDonorByWallet(walletAddress: string) {
  return prisma.donor.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() },
  });
}
