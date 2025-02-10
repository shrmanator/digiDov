import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "./thirdwebClient";

const privateKey = process.env.THIRDWEB_ADMIN_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.");
}

const domain = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN;
if (!domain) {
  throw new Error("Missing NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN in .env file.");
}

// Create a singleton instance of thirdwebAuth
const thirdwebAuth = createAuth({
  domain,
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client,
});

export default thirdwebAuth;
