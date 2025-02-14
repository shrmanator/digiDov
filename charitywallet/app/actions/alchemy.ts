import { Alchemy, Network } from "alchemy-sdk";

export async function updateWebhookAddresses(
  webhookId: string,
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
  await alchemy.notify.updateWebhook(webhookId, {
    addAddresses,
    removeAddresses,
  });
}
