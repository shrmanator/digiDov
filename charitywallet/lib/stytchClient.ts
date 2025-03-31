import { Client, envs } from "stytch";

const stytchClient = new Client({
  project_id: process.env.STYTCH_PROJECT_ID!,
  secret: process.env.STYTCH_SECRET!,
  env: process.env.STYTCH_ENV === "stytch_live" ? envs.live : envs.test,
});

export default stytchClient;
