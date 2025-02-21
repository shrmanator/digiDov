import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedWallet } from "@/lib/jwtAuth";

export async function GET() {
  try {
    const walletAddress = await getAuthenticatedWallet();
    const charity = await prisma.charity.findUnique({
      where: { wallet_address: walletAddress },
    });
    if (!charity) {
      return NextResponse.json(
        { error: "Charity record not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(charity);
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
