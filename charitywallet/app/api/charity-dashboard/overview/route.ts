// app/api/charity-dashboard/overview/route.ts
import { NextResponse } from "next/server";
import { getAuthenticatedWallet } from "@/lib/jwtAuth";
import { upsertCharity, CharityInput } from "@/app/actions/charities";

export async function POST(request: Request) {
  try {
    // 1) authenticate the user
    const wallet = await getAuthenticatedWallet();

    // 2) parse + validate JSON
    let data: Partial<Pick<CharityInput, "charity_sends_receipt">>;
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

    // 3) Delegate to your server-action, marking the profile complete
    const updated = await upsertCharity({
      wallet_address: wallet,
      charity_sends_receipt: data.charity_sends_receipt,
      is_profile_complete: true,
    });

    // 4) Return the full upsert result (including slug, etc.)
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST /api/charity-dashboard/overview error:", message);
    return NextResponse.json(
      { error: message || "Unexpected error" },
      { status: 500 }
    );
  }
}
