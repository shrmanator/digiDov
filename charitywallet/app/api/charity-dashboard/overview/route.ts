import { NextResponse } from "next/server";
import { getAuthenticatedWallet } from "@/lib/jwtAuth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const wallet = await getAuthenticatedWallet(); // no args

    let data: { charity_sends_receipt?: boolean };
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
    if (typeof data.charity_sends_receipt !== "boolean") {
      return NextResponse.json(
        { error: "`charity_sends_receipt` must be boolean" },
        { status: 422 }
      );
    }

    const updated = await prisma.charity.update({
      where: { wallet_address: wallet },
      data: { charity_sends_receipt: data.charity_sends_receipt },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("POST /api/dashboard/overview error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
