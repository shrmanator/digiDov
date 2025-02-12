import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedWallet } from "@/lib/jwtAuth";

export async function GET() {
  try {
    const walletAddress = await getAuthenticatedWallet();
    const charity = await prisma.charities.findUnique({
      where: { wallet_address: walletAddress },
    });
    if (!charity) {
      return NextResponse.json(
        { error: "Charity record not found" },
        { status: 404 }
      );
    }
    // Return the charity object directly.
    return NextResponse.json(charity);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
