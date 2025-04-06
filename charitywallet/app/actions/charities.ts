"use server";

import prisma from "@/lib/prisma";
import slugify from "slugify";
import { addWalletAddressToMoralis } from "./moralis";
import { verifyOtpAction } from "./otp";

export interface CharityInput {
  charity_name?: string | null;
  registered_address?: string | null;
  registration_number?: string | null;
  contact_title?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
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
  const walletAddress = data.wallet_address.toLowerCase();

  if (data.registration_number) {
    data.registration_number = validateAndFormatRegistrationNumber(
      data.registration_number
    );
  }

  const existingCharity = await prisma.charity.findUnique({
    where: { wallet_address: walletAddress },
    select: { wallet_address: true },
  });
  const isNewCharity = !existingCharity;

  let slug: string | undefined = undefined;
  if (data.charity_name) {
    slug = await generateUniqueSlug(data.charity_name);
  }

  const charity = await prisma.charity.upsert({
    where: { wallet_address: walletAddress },
    update: {
      charity_name: data.charity_name ?? undefined,
      registered_office_address: data.registered_address ?? undefined,
      registration_number: data.registration_number ?? undefined,
      contact_title: data.contact_title ?? undefined,
      contact_first_name: data.contact_first_name ?? undefined,
      contact_last_name: data.contact_last_name ?? undefined,
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
      contact_first_name: data.contact_first_name ?? null,
      contact_last_name: data.contact_last_name ?? null,
      contact_email: data.contact_email ?? null,
      contact_mobile_phone: data.contact_phone ?? null,
      wallet_address: walletAddress,
      is_profile_complete: data.is_profile_complete ?? false,
      slug: slug ?? null,
    },
  });

  if (isNewCharity) {
    try {
      await addWalletAddressToMoralis(walletAddress);
    } catch (error) {
      console.error("Failed to add wallet address to Moralis:", error);
      // Decide whether to propagate the error or just log it.
    }
  }

  return charity;
}

function validateAndFormatRegistrationNumber(input: string): string {
  // Convert to uppercase
  const regNumber = input.toUpperCase();
  // Validate: must be alphanumeric and up to 15 characters
  if (!/^[A-Z0-9]{1,15}$/.test(regNumber)) {
    throw new Error(
      "Invalid registration number. It must be alphanumeric, uppercase, and up to 15 characters."
    );
  }
  return regNumber;
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

export async function addCharityFundTransferToDb({
  charityId,
  amountWei,
  destinationWallet,
  transactionHash,
  chainId,
  historicalPrice,
  fiatCurrency = "cad",
}: {
  charityId: string;
  amountWei: string;
  destinationWallet: string;
  transactionHash: string;
  chainId: string;
  historicalPrice: number | null;
  fiatCurrency: string;
}) {
  try {
    const newTransfer = await prisma.charity_fund_transfer.create({
      data: {
        charity_id: charityId,
        amount_wei: BigInt(amountWei),
        fiat_equivalent: historicalPrice,
        fiat_currency: fiatCurrency,
        destination_wallet: destinationWallet,
        transaction_hash: transactionHash,
        chain_id: chainId,
      },
    });
    console.log("newTransfer", newTransfer);
    return { success: true, transfer: newTransfer };
  } catch (error: unknown) {
    const prismaError = error as {
      code?: string;
      meta?: { target?: string[] };
    };
    if (
      prismaError.code === "P2002" &&
      prismaError.meta?.target &&
      prismaError.meta.target.includes("transaction_hash")
    ) {
      console.log("Transaction hash already exists, skipping insertion.");
      return { success: false, error: "Transaction already added to db" };
    }
    console.error("Error logging transaction:", error);
    return { success: false, error: "Failed to add transaction to db" };
  }
}

export async function getCharityFundTransfers(charityId: string) {
  try {
    const transfers = await prisma.charity_fund_transfer.findMany({
      where: { charity_id: charityId },
      orderBy: { created_at: "desc" },
    });
    return { success: true, transfers };
  } catch (error) {
    console.error("Error retrieving charity fund transfers:", error);
    return {
      success: false,
      error: "Failed to retrieve charity fund transfers",
    };
  }
}

export async function getCharityByWalletAddress(wallet_address: string) {
  const walletAddress = wallet_address.toLowerCase();

  return prisma.charity.findUnique({
    where: { wallet_address: walletAddress },
  });
}

/**
 * Updates a charity profile only if the provided OTP is verified.
 * @param formData - The form data containing the charity profile.
 * @param otp - The OTP code provided by the user.
 * @param methodId - The method_id returned from sendOtpAction.
 */
export async function updateCharityProfileAction(
  formData: FormData,
  otp: string,
  methodId: string
): Promise<void> {
  // Verify the OTP on the server (this call consumes the OTP).
  const { status_code } = await verifyOtpAction(methodId, otp);
  if (status_code !== 200) {
    throw new Error("OTP verification failed.");
  }
  console.log("OTP verified successfully.", status_code);

  // Prepare the charity input.
  const charityInput: CharityInput = {
    charity_name: formData.get("charity_name")?.toString() || null,
    registered_address: formData.get("registered_address")?.toString() || null,
    registration_number:
      formData.get("registration_number")?.toString() || null,
    contact_first_name: formData.get("contact_first_name")?.toString() || null,
    contact_last_name: formData.get("contact_last_name")?.toString() || null,
    contact_email: formData.get("contact_email")?.toString() || null,
    contact_phone: formData.get("contact_phone")?.toString() || null,
    wallet_address: formData.get("wallet_address")!.toString(),
    is_profile_complete: true,
  };

  // Proceed with updating the charity profile.
  await upsertCharity(charityInput);
}
