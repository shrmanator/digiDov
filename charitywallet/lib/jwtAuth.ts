import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";

export async function getAuthenticatedWallet(): Promise<string> {
  const cookieStore = cookies();
  const jwtCookie = (await cookieStore).get("jwt");
  if (!jwtCookie?.value) {
    throw new Error("Not authenticated");
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwtCookie.value });
  if (!authResult.valid) {
    throw new Error("Invalid token");
  }

  // The wallet address is stored in the 'sub' field
  return authResult.parsedJWT.sub.toLowerCase();
}
