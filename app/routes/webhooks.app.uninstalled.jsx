import { authenticate } from "../shopify.server";
import db from "../db.server";
import { markAppUninstalled } from "../utils/billing.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  await markAppUninstalled(shop);
  await db.session.deleteMany({ where: { shop } });

  return new Response();
};
