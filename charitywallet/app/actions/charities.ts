"use server";

import prisma from "@/lib/prisma";
import slugify from "slugify";

export interface CharityInput {
  charity_name?: string | null;
  registered_address?: string | null;
  registration_number?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  wallet_address: string;
  is_profile_complete?: boolean;
}

// Helper function to generate a unique slug based on charity_name
async function generateUniqueSlug(charity_name: string): Promise<string> {
  const baseSlug = slugify(charity_name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.charity.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function upsertCharity(data: CharityInput) {
  console.log("wallet_address", data.wallet_address);
  const walletAddress = data.wallet_address.toLowerCase();

  let slug: string | undefined = undefined;
  if (data.charity_name) {
    slug = await generateUniqueSlug(data.charity_name);
  }

  return prisma.charity.upsert({
    where: { wallet_address: walletAddress },
    update: {
      charity_name: data.charity_name ?? undefined,
      registered_office_address: data.registered_address ?? undefined,
      registration_number: data.registration_number ?? undefined,
      contact_name: data.contact_name ?? undefined,
      contact_email: data.contact_email ?? undefined,
      contact_mobile_phone: data.contact_phone ?? undefined,
      ...(typeof data.is_profile_complete !== "undefined"
        ? { is_profile_complete: data.is_profile_complete }
        : {}),
      ...(slug ? { slug } : {}),
    },
    create: {
      charity_name: data.charity_name ?? null,
      registered_office_address: data.registered_address ?? null,
      registration_number: data.registration_number ?? null,
      contact_name: data.contact_name ?? null,
      contact_email: data.contact_email ?? null,
      contact_mobile_phone: data.contact_phone ?? null,
      wallet_address: walletAddress,
      is_profile_complete: data.is_profile_complete ?? false,
      slug: slug ?? null,
    },
  });
}

export async function updateCharityEmail(params: {
  wallet_address: string;
  email: string;
}) {
  const walletAddress = params.wallet_address.toLowerCase();
  return prisma.charity.update({
    where: { wallet_address: walletAddress },
    data: {
      contact_email: params.email,
    },
  });
}

export async function getCharityBySlug(slug: string) {
  return prisma.charity.findUnique({
    where: { slug },
  });
}

export async function getCharitySlugByWalletAddress(wallet_address: string) {
  const walletAddress = wallet_address.toLowerCase();
  const charity = await prisma.charity.findUnique({
    where: { wallet_address: walletAddress },
    select: { slug: true },
  });
  return charity?.slug;
}
