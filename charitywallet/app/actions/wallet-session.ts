"use server";

import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";

export async function getCurrentWallet(): Promise<string> {
  const jwtCookie = (await cookies()).get("jwt")?.value;
  if (!jwtCookie) {
    throw new Error("Not authenticated");
  }

  const jwtResult = await thirdwebAuth.verifyJWT({ jwt: jwtCookie });
  if (!jwtResult.valid) {
    throw new Error("Invalid or expired login session");
  }
  const sub = jwtResult.parsedJWT.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("JWT missing wallet address");
  }
  return sub.toLowerCase();
}
