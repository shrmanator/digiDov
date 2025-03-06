"use server";
import prisma from "@/lib/prisma";

export interface DonorInput {
  walletAddress: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
}

function isProfileComplete(data: DonorInput): boolean {
  return Boolean(
    data.email?.trim() &&
      data.firstName?.trim() &&
      data.lastName?.trim() &&
      data.address?.trim()
  );
}

export async function upsertDonor(data: DonorInput) {
  const walletAddress = data.walletAddress.toLowerCase();
  const { email, firstName, lastName, address } = data;

  // Determine if any new profile data is provided
  const hasNewProfileData = Boolean(email || firstName || lastName || address);

  if (email) {
    // Check if email is already taken by another donor
    const existingEmail = await prisma.donor.findUnique({
      where: { email },
    });

    if (existingEmail && existingEmail.wallet_address !== walletAddress) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  }

  // Fetch the existing donor (if any)
  const existingDonor = await prisma.donor.findUnique({
    where: { wallet_address: walletAddress },
  });

  // Use new data to recalc complete if provided; otherwise, preserve existing value.
  const complete = hasNewProfileData
    ? isProfileComplete(data)
    : existingDonor?.is_profile_complete ?? false;

  // Build the update and create payloads
  const updateData = {
    email: email ?? undefined,
    first_name: firstName ?? undefined,
    last_name: lastName ?? undefined,
    address: address ?? undefined,
    is_profile_complete: complete,
  };

  const createData = {
    wallet_address: walletAddress,
    email: email ?? null,
    first_name: firstName ?? null,
    last_name: lastName ?? null,
    address: address ?? null,
    is_profile_complete: complete,
  };

  return prisma.donor.upsert({
    where: { wallet_address: walletAddress },
    update: updateData,
    create: createData,
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
