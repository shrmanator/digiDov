import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth"; // Import our singleton

export async function GET() {
  const cookieStore = cookies();
  const jwtCookie = (await cookieStore).get("jwt");

  if (!jwtCookie?.value) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwtCookie.value });
  if (!authResult.valid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Apparently, the wallet address is stored in the sub field of the JWT...
  const walletAddress = authResult.parsedJWT.sub.toLowerCase();

  try {
    const charity = await prisma.charities.findUnique({
      where: { wallet_address: walletAddress },
    });

    if (!charity) {
      return NextResponse.json(
        { error: "Charity record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ charity });
  } catch (_error) {
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
