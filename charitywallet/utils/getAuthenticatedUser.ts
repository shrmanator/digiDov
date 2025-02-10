import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";

export interface AuthenticatedUser {
  walletAddress: string;
  // you can add other properties from the token payload if needed
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

  // Extract the wallet address (assuming it's in the "sub" field)
  const walletAddress = authResult.parsedJWT.sub.toLowerCase();

  return { walletAddress };
}
