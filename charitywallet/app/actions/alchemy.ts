import { Alchemy, Network } from "alchemy-sdk";

export async function updateWebhookAddresses(
  addAddresses: string[],
  removeAddresses: string[],
  network: Network
) {
  const authToken = process.env.ALCHEMY_NOTIFY_AUTH_TOKEN;
  if (!authToken) {
    throw new Error("Missing ALCHEMY_NOTIFY_AUTH_TOKEN environment variable");
  }

  const settings = {
    authToken,
    network,
  };

  const alchemy = new Alchemy(settings);
  const webhookId = process.env.ALCHEMY_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("Missing ALCHEMY_WEBHOOK_ID environment variable");
  }

  await alchemy.notify.updateWebhook(webhookId, {
    addAddresses,
    removeAddresses,
  });
}
