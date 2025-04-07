import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";

export interface AuthenticatedUser {
  walletAddress: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = cookies();
  const jwtCookie = (await cookieStore).get("jwt");

  if (!jwtCookie?.value) {
    return null;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwtCookie.value });
  if (!authResult.valid) {
    return null;
  }
  const walletAddress = authResult.parsedJWT.sub.toLowerCase();

  return { walletAddress };
}
