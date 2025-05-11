import { NextResponse } from "next/server";
import { getAuthenticatedWallet } from "@/lib/jwtAuth";
import { upsertCharity, CharityInput } from "@/app/actions/charities";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const wallet = await getAuthenticatedWallet();
    let data: Partial<CharityInput>;
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

    const input: CharityInput = {
      ...data,
      wallet_address: wallet,
      is_profile_complete: true,
    } as CharityInput;

    try {
      const updated = await upsertCharity(input);
      if (!updated) {
        return NextResponse.json({ error: "Upsert failed" }, { status: 500 });
      }
      return NextResponse.json({ charity: updated });
    } catch (err: any) {
      // Handle unique constraint on phone
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        Array.isArray(err.meta?.target) &&
        (err.meta.target as string[]).includes("contact_mobile_phone")
      ) {
        return NextResponse.json(
          { error: "This phone number is already in use by another charity." },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST /api/charity-dashboard/overview error:", message);
    return NextResponse.json(
      { error: message || "Unexpected error" },
      { status: 500 }
    );
  }
}
