import { Client, envs } from "stytch";

if (!process.env.STYTCH_PROJECT_ID) {
  throw new Error("Missing STYTCH_PROJECT_ID in environment variables");
}

if (!process.env.STYTCH_CLIENT_SECRET) {
  throw new Error("Missing STYTCH_CLIENT_SECRET in environment variables");
}

const stytchClient = new Client({
  project_id: process.env.STYTCH_PROJECT_ID,
  secret: process.env.STYTCH_CLIENT_SECRET,
  env: envs.live,
});

export default stytchClient;
